# run.py
from livereload import Server
from app import create_app

def main():
    app = create_app()
    server = Server(app.wsgi_app)
    server.watch("app/templates/**/*.html")
    server.watch("static/**/*.*")
    server.serve(
        host=app.config.get('HOST', '127.0.0.1'),
        port=app.config.get('PORT', 5001),
        debug=True
    )

if __name__ == "__main__":
    main()
