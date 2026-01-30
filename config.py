import os

class DefaultConfig:
    SECRET_KEY = os.getenv('BAAPP_SECRET_KEY', 'ba_generator_secret_2026')
    HOST = os.getenv('BAAPP_HOST', '127.0.0.1')
    PORT = int(os.getenv('BAAPP_PORT', '5001'))
    DEBUG = os.getenv('BAAPP_DEBUG', 'True').lower() in ('1','true','yes')
    PROCESSED_FILES_DIR = os.path.join(os.getcwd(), 'processed_results')
    VERSION = '2.0.0-keywords'