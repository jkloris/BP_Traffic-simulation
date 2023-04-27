import os
import traceback


class FileHandler():
    files = {}

    # Creates new file and stores it.
    # If File with same name exists, overwrites it.
    # @port {string} Identifier of websocket
    # @format {string} Must be either "net" or "trips". Labels file type
    def handleNewFile(self, port, format):
        if format != "net" and format != "trips":
            return

        try:
            os.remove(f"../sumo/upload/upload{port}.{format}.xml")
        except:
            print("file not existing!")
        finally:
            if port not in self.files:
                self.files[port] = {}

            self.files[port][format] = open(
                f"../sumo/upload/upload{port}.{format}.xml", 'ab')

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
            os.remove(f"../sumo/upload/upload{port}.sumocfg")
        except Exception:
            print(traceback.format_exc())

        try:
            os.remove(f"../sumo/upload/upload{port}.trips.xml")
        except Exception:
            print(traceback.format_exc())

        try:
            os.remove(f"../sumo/upload/upload{port}.net.xml")
        except Exception:
            print(traceback.format_exc())

        del self.files[port]

    # Creates sumocfg file for uploaded files that is needed for simulation to start
    # @port {string} Identifier of websocket
    def setupConfig(self, port):
        if port not in self.files or "net" not in self.files[port] or "trips" not in self.files[port]:
            print("Missing files for config file")
            return False

        data = f"""<?xml version="1.0" encoding="UTF-8"?>
                <configuration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://sumo.dlr.de/xsd/sumoConfiguration.xsd">

                    <input>
                        <net-file value="./upload{port}.net.xml"/>
                        <route-files value="./upload{port}.trips.xml"/>
                    </input>

                    <report>
                        <verbose value="false"/>
                        <duration-log.statistics value="true"/>
                        <no-step-log value="true"/>
                    </report>

                </configuration>"""

        with open(f"../sumo/upload/upload{port}.sumocfg", "w") as f:
            f.write(data)
            self.files[port]["sumocfg"] = f

        return True
