from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/problem')
def problem():
    return render_template('problem.html')

@app.route('/solution')
def solution():
    return render_template('solution.html')

@app.route('/action')
def action():
    return render_template('action.html')

@app.route('/sources')
def sources():
    return render_template('sources.html')

if __name__ == '__main__':
    app.run()