from flask import Flask
from app.routes.main import main_blueprint
from app.routes.generate import generate_bp
from app.routes.debug_cpu import cpu_info_bp
from app.routes.health_check import health_check_bp
from app.routes.pronunciationv3 import pronunciationv3_bp
from app.routes.word_level import word_level_bp

def create_app(config_class='config.Config'):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.register_blueprint(generate_bp)
    app.register_blueprint(cpu_info_bp)
    app.register_blueprint(main_blueprint)
    app.register_blueprint(health_check_bp)
    app.register_blueprint(pronunciationv3_bp)
    app.register_blueprint(word_level_bp)
    return app
