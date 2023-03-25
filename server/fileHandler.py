import os


class FileHandler():
    files = {}

    # Creates new file and stores it.
    # If File with same name exists, overwrites it.
    # @port {string} Identifier of websocket
    # @format {string} Must be either "net" or "trips". Labels file type
    def handleNewFile(self, port, format):
        if format != "net" or format != "trips":
            return

        try:
            os.remove(f"../sumo/upload{port}.{format}.xml")
        except:
            print("file not existing!")
        finally:
            if port not in self.files:
                self.files[port] = {}

            self.files[port][format] = open(f"../sumo/upload{port}.{format}.xml", 'ab')

    # Writes data into the file.
    # @port {string} Identifier of websocket
    # @message {bites} Data that are beeing written to the file
    def appendToFile(self, port, message):
        if "net" in self.files[port] and self.files[port]["net"].closed == False:
            self.files[port]["net"].write(message)
            return

        if "trips" in self.files[port] and self.files[port]["trips"].closed == False:
            self.files[port]["trips"].write(message)

    # Closes file. It is important for appendToFile function, because closed files cannot be written to.
    # @port {string} Identifier of websocket
    # @format {string} Must be either "net" or "trips". Labels file type
    def closeFile(self, port, format):
        if port in self.files and format in self.files[port]:
            self.files[port][format].close()

    # Removes uploaded files from directory and their refference in this class
    # @port {string} Identifier of websocket
    def removeFile(self, port):
        try:
            os.remove(f"../sumo/upload{port}.trips.xml")
        except:
            print("Trip file does not exist!")
        try:
            os.remove(f"../sumo/upload{port}.net.xml")
        except:
            print("Net file does not exist!")

        del self.files[port]
