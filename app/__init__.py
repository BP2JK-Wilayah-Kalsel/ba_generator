import logging
import os
import sys
import locale
from flask import Flask


def setup_logging():
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(levelname)s %(name)s: %(message)s')

def _set_locale():
    try:
        locale.setlocale(locale.LC_TIME, 'id_ID.UTF-8')
    except:
        try:
            locale.setlocale(locale.LC_TIME, 'Indonesian_Indonesia.1252')
        except:
            pass


def create_app(config_object='config.DefaultConfig'):
    setup_logging()
    _set_locale()
    
    # Determine static folder path
    if getattr(sys, 'frozen', False):
        # Running as compiled executable (PyInstaller)
        # In onedir mode, sys._MEIPASS is the _internal directory where resources are bundled
        base_dir = sys._MEIPASS
    else:
        # Running as script
        # Go up one level from 'app' package to get to project root
        base_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
        
    static_dir = os.path.join(base_dir, 'static')
    
    # Use package-local `templates/` inside the `app` package and keep repo-level
    # `static/` directory for static assets.
    app = Flask(__name__, instance_relative_config=False,  template_folder="templates", static_folder=static_dir)
    app.config.from_object(config_object)
    # register blueprints (use lightweight routes during incremental refactor)
    from .simple_routes import bp as main_bp
    app.register_blueprint(main_bp)
    # UI blueprint (migrated from legacy monolith)
    from .routes_ui import bp as ui_bp
    app.register_blueprint(ui_bp)
    # Register processing & admin blueprints
    from .routes_processing import bp as processing_bp
    app.register_blueprint(processing_bp)
    # Register preview and pembuktian blueprints
    from .routes_preview import bp as preview_bp
    app.register_blueprint(preview_bp)
    from .routes_pembuktian import bp as pembuktian_bp
    app.register_blueprint(pembuktian_bp)

    # Register SPSE crawler blueprint
    from .spse_blueprint import bp as spse_bp
    app.register_blueprint(spse_bp)
    # Register minimal API blueprint
    from .routes_api import bp as api_bp
    app.register_blueprint(api_bp)
    return app
