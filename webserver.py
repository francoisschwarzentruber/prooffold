#!/usr/bin/env python
# Inspired by  https://stackoverflow.com/a/25708957/51280
from http.server import SimpleHTTPRequestHandler
import socketserver
import socket
import select



class TCPServerV4(socketserver.TCPServer):
    address_family = socket.AF_INET
    allow_reuse_address = True

    def __init__(self, server_address, RequestHandlerClass):
        socketserver.TCPServer.__init__(self, server_address, RequestHandlerClass)
        self._shutdown_request = False

    def serve_forever(self, poll_interval=0.5):
        """provide an override that can be shutdown from a request handler.
        The threading code in the BaseSocketServer class prevented this from working
        even for a non-threaded blocking server.
        """
        try:
            while not self._shutdown_request:
                # XXX: Consider using another file descriptor or
                # connecting to the socket to wake this up instead of
                # polling. Polling reduces our responsiveness to a
                # shutdown request and wastes cpu at all other times.
                r, w, e = socketserver._eintr_retry(select.select, [self], [], [],
                                       poll_interval)
                if self in r:
                    self._handle_request_noblock()
        finally:
            self._shutdown_request = False


class MyHTTPRequestHandler(SimpleHTTPRequestHandler):

    def end_headers(self):
        self.send_my_headers()
        SimpleHTTPRequestHandler.end_headers(self)

    def send_my_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")

    #def handle(self):
    #    setattr(self.server, '_BaseServer__shutdown_request', True)
        #data = self.request.recv(4096)
        #if data == "shutdown":
        #    self.server._shutdown_request = True


if __name__ == '__main__':
    #socketserver.TCPServer.shutdown

    port = 8888
    server_address = ("", port)
    #server = TCPServerV4(server_address, MyHTTPRequestHandler)
    httpd = socketserver.TCPServer(server_address, MyHTTPRequestHandler)

    #httpd.server_close()
    #httpd.socket.close()
    try:
        httpd.serve_forever()
        print("serving at port", port)
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    httpd.socket.close()