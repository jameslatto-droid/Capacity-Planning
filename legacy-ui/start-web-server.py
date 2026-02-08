# Simple Web Server for Chat Interface
# Run this script and access from iPhone at: http://192.168.1.66:8080/chat.html

import http.server
import socketserver
import os
import urllib.request
import urllib.error


# Change to the LLM directory
os.chdir(r'e:\LLM')

PORT = 8080
OLLAMA_TARGET = "http://192.168.1.66:11434"
SD_TARGET = "http://192.168.1.66:7860"


class ProxyingRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        if self.path.startswith("/ollama/") or self.path.startswith("/sd/"):
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.end_headers()
            return
        super().do_OPTIONS()

    def do_GET(self):
        if self.path.startswith("/ollama/"):
            self._proxy_request(OLLAMA_TARGET, self.path[len("/ollama"):])
            return
        if self.path.startswith("/sd/"):
            self._proxy_request(SD_TARGET, self.path[len("/sd"):])
            return
        super().do_GET()

    def do_POST(self):
        if self.path.startswith("/ollama/"):
            self._proxy_request(OLLAMA_TARGET, self.path[len("/ollama"):])
            return
        if self.path.startswith("/sd/"):
            self._proxy_request(SD_TARGET, self.path[len("/sd"):])
            return
        super().do_POST()

    def _proxy_request(self, base_url, path):
        url = f"{base_url}{path}"
        data = None
        if "Content-Length" in self.headers:
            length = int(self.headers.get("Content-Length", 0))
            data = self.rfile.read(length) if length > 0 else None

        req = urllib.request.Request(url, data=data, method=self.command)
        for key, value in self.headers.items():
            lower_key = key.lower()
            if lower_key in ("host", "origin", "referer", "content-length", "accept-encoding", "connection"):
                continue
            req.add_header(key, value)

        try:
            with urllib.request.urlopen(req) as resp:
                body = resp.read()
                self.send_response(resp.status)
                for header, value in resp.headers.items():
                    lower_header = header.lower()
                    if lower_header in ("transfer-encoding", "content-encoding", "content-length", "connection"):
                        continue
                    self.send_header(header, value)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
                self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                if body:
                    self.wfile.write(body)
        except urllib.error.HTTPError as e:
            body = e.read()
            self.send_response(e.code)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if body:
                self.wfile.write(body)
        except urllib.error.URLError as e:
            error_body = f"Proxy error: {e.reason}".encode("utf-8")
            self.send_response(502)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Content-Length", str(len(error_body)))
            self.end_headers()
            self.wfile.write(error_body)
        except Exception as e:
            error_body = f"Proxy error: {e}".encode("utf-8")
            self.send_response(502)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Content-Length", str(len(error_body)))
            self.end_headers()
            self.wfile.write(error_body)

print(f"Starting web server on port {PORT}...")
print(f"Access from iPhone at: http://192.168.1.66:{PORT}/chat.html")
print(f"Or from PC at: http://localhost:{PORT}/chat.html")
print(f"Proxy endpoints:")
print(f"  - Ollama: http://192.168.1.66:{PORT}/ollama")
print(f"  - Stable Diffusion: http://192.168.1.66:{PORT}/sd")
print("\nPress Ctrl+C to stop the server\n")

class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True


with ThreadingTCPServer(("0.0.0.0", PORT), ProxyingRequestHandler) as httpd:
    httpd.serve_forever()
