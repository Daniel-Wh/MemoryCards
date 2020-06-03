from db import db
from sqlalchemy.orm import scoped_session, sessionmaker

DBSession = scoped_session(sessionmaker())


class Cards(db.Model):
    # create table
    __tablename__ = 'Cards'

    id = db.Column(db.Integer, primary_key=True)

    question = db.Column(db.String(256))
    answer = db.Column(db.String(256))
    course = db.Column(db.String(64))
    user = db.relationship('User')

    def __init__(self, question, answer, course):
        self.question = question
        self.answer = answer
        self.course = course

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()


class User(db.Model):

    __tablename__ = 'User'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    children = db.relationship('Cards')

    def __init__(self, email, password):
        self.email = email
        self.password = password

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
