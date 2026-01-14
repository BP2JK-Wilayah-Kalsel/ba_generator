from app import create_app


def main():
    app = create_app()
    host = app.config.get('HOST', '127.0.0.1')
    port = app.config.get('PORT', 5001)
    debug = app.config.get('DEBUG', False)
    app.run(host=host, port=port, debug=debug)


if __name__ == '__main__':
    main()
