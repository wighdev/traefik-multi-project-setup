from flask import Flask, jsonify
from datetime import datetime
import os

app = Flask(__name__)

@app.route('/')
def home():
    return f'''
    <html>
        <head><title>Project 2 - Python Flask App</title></head>
        <body style="font-family: Arial; padding: 40px; background: #f9f9f9;">
            <h1 style="color: #27ae60;">🐍 Project 2 - Python Flask Application</h1>
            <p>This is a sample Flask application running on port 8000</p>
            <p><strong>Server Time:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
            <p><strong>Python Version:</strong> 3.9</p>
            <p><strong>Flask Version:</strong> Latest</p>
            <a href="/" style="background: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Refresh</a>
            <a href="/api/info" style="background: #f39c12; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">API Info</a>
            <a href="/jenkins" style="background: #e74c3c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">Jenkins</a>
        </body>
    </html>
    '''

@app.route('/api/info')
def api_info():
    return jsonify({
        'project': 'Project 2',
        'technology': 'Python Flask',
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'endpoints': ['/', '/api/info']
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)