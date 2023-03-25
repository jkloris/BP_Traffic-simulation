import os


class FileHandler():
    files = {}

    def handleNewFile(self, port, format):

        try:
            os.remove(f"../sumo/upload{port}.{format}.xml")
        except:
            print("file not existing!")
        finally:
            if port not in self.files:
                self.files[port] = {}

            self.files[port][format] = open(f"../sumo/upload{port}.{format}.xml", 'ab')

    def appendToFile(self, port, message):
        if "net" in self.files[port] and self.files[port]["net"].closed == False:
            self.files[port]["net"].write(message)
            return

        if "trip" in self.files[port] and self.files[port]["trip"].closed == False:
            self.files[port]["trip"].write(message)
            
    def closeFile(self, port, format):
        self.files[port][format].close()

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
