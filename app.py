from flask import Flask, render_template
from flask_restful import Api
from db import db as db
from models import CardsModel


app = Flask(__name__)
uri = 'sqlite:///data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = uri
api = Api(app)
db.init_app(app)


@app.before_first_request
def create_tables():
    db.create_all()


@app.route('/')
def hello_world():
    return 'hello world!'


@app.route('/register')
def register_new_user():
    return 'new user'


if __name__ == '__main__':
    app.run()
