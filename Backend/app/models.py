from app.database import db
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True)
    password = db.Column(db.String(200), nullable=False)
    trust_score = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    hosted_trips = db.relationship("Trip", backref="host", lazy=True)
    bookings = db.relationship("Booking", backref="passenger", lazy=True)

    def __repr__(self):
        return f"<User {self.username}>"


class VehicleType(db.Model):
    __tablename__ = "vehicle_types"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    max_passengers = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    trips = db.relationship("Trip", backref="vehicle_type", lazy=True)

    def __repr__(self):
        return f"<VehicleType {self.name}>"


class Trip(db.Model):
    __tablename__ = "trips"

    id = db.Column(db.Integer, primary_key=True)
    host_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    vehicle_type_id = db.Column(
        db.Integer, db.ForeignKey("vehicle_types.id"), nullable=False
    )
    source_location = db.Column(db.String(255), nullable=False)
    destination_location = db.Column(db.String(255), nullable=False)
    departure_time = db.Column(db.DateTime, nullable=False)
    total_seats = db.Column(db.Integer, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    estimated_total_fare = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="draft")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    route_points = db.relationship(
        "RoutePoint", backref="trip", lazy=True, cascade="all, delete-orphan"
    )
    bookings = db.relationship(
        "Booking", backref="trip", lazy=True, cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Trip {self.id}>"


class RoutePoint(db.Model):
    __tablename__ = "route_points"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    point_type = db.Column(db.String(20), nullable=False)  # pickup / drop
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    address = db.Column(db.String(255))
    sequence_order = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<RoutePoint {self.id}>"


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    passenger_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    assigned_pickup_point_id = db.Column(db.Integer, db.ForeignKey("route_points.id"))
    assigned_drop_point_id = db.Column(db.Integer, db.ForeignKey("route_points.id"))
    booking_status = db.Column(db.String(20), default="pending")
    fare_amount = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    payments = db.relationship("Payment", backref="booking", lazy=True)

    def __repr__(self):
        return f"<Booking {self.id}>"


class HostRating(db.Model):
    __tablename__ = "host_ratings"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    host_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    rated_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    review = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class PassengerRating(db.Model):
    __tablename__ = "passenger_ratings"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    passenger_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    rated_by_host_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    review = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class StopRequest(db.Model):
    __tablename__ = "stop_requests"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    passenger_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    requested_address = db.Column(db.String(255), nullable=False)
    requested_latitude = db.Column(db.Float, nullable=False)
    requested_longitude = db.Column(db.Float, nullable=False)
    extra_distance_km = db.Column(db.Float)
    extra_time_minutes = db.Column(db.Integer)
    additional_fare = db.Column(db.Float)
    status = db.Column(db.String(20), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Route(db.Model):
    __tablename__ = "routes"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(
        db.Integer, db.ForeignKey("trips.id"), nullable=False, unique=True
    )
    total_distance_km = db.Column(db.Float)
    estimated_duration_minutes = db.Column(db.Integer)
    encoded_polyline = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class FareCalculation(db.Model):
    __tablename__ = "fare_calculations"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    passenger_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    base_fare = db.Column(db.Float, nullable=False)
    detour_charge = db.Column(db.Float, default=0)
    final_fare = db.Column(db.Float, nullable=False)
    calculated_distance_km = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False)
    payer_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    receiver_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(20), nullable=False)  # online / cod
    payment_status = db.Column(db.String(20), default="pending")
    transaction_reference = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Payment {self.id}>"
