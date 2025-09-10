from flask import Flask, render_template_string
import os
from datetime import datetime

app = Flask(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Project 2 - Python Flask App</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #fff8f0; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #ff6b35; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Project 2 - Python Flask Application</h1>
        <p>This is an example Python Flask application running through Traefik reverse proxy.</p>
        <p><strong>Port:</strong> {{ port }}</p>
        <p><strong>Debug Mode:</strong> {{ debug }}</p>
        <p><strong>Current Time:</strong> {{ current_time }}</p>
        <p><a href="/">Back to Dashboard</a></p>
    </div>
</body>
</html>
"""

@app.route('/')
def home():
    return render_template_string(HTML_TEMPLATE, 
                                port=os.environ.get('PORT', '8000'),
                                debug=os.environ.get('DEBUG', 'False'),
                                current_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

@app.route('/api/status')
def status():
    return {
        'status': 'running',
        'port': os.environ.get('PORT', '8000'),
        'debug': os.environ.get('DEBUG', 'False'),
        'timestamp': datetime.now().isoformat()
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)