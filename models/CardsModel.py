from db import db


class Cards(db.Model):
    # create table
    __tablename__ = 'Cards'

    id = db.Column(db.Integer, primary_key=True)

    question = db.Column(db.String(256))
    answer = db.Column(db.String(256))
    course = db.Column(db.String(64))
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'))

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
    cards = db.relationship('Cards', backref='user')

    def __init__(self, email, password):
        self.email = email
        self.password = password

    def json(self):
        return {
            'id': self.id,
            'email': self.email
        }

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_by_username(cls, email):
        return cls.query.filter_by(email=email).first()

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(id=_id).first()
