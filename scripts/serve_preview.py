"""Serve this checkout without browser caching; independent of the shell directory."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).resolve().parent.parent), **kwargs)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()
parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=5188)
args = parser.parse_args()
ThreadingHTTPServer(('127.0.0.1', args.port), PreviewHandler).serve_forever()
