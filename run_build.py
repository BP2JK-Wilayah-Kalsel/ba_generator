# run.py (FINAL RELEASE)
import threading
import webbrowser
from app import create_app

def run_app():
    app = create_app()
    app.run(
        host=app.config.get('HOST', '127.0.0.1'),
        port=app.config.get('PORT', 5001),
        debug=False,
        use_reloader=False
    )

def main():
    threading.Timer(
        1.0,
        lambda: webbrowser.open("http://127.0.0.1:5001")
    ).start()
    run_app()

if __name__ == "__main__":
    main()
