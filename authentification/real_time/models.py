from django.db import models
from django.contrib.auth import get_user_model

class Data(models.Model):
    """
    Model representing data collected from measurements.

    Attributes:
    - user (ForeignKey): The user associated with the data.
    - session_id (IntegerField): ID representing the session during which the data was collected.
    - shot_id (IntegerField): ID representing the shot or measurement within the session.
    - measurement_date (DateTimeField): Date and time when the data was recorded (auto-generated on creation).
    - gravity_center (JSONField): JSON data field storing coordinates of the gravity center.
    - quaternion (JSONField): JSON data field storing quaternion values representing orientation.
    - sliders_value (JSONField): JSON data field storing values of sliders used in measurements.

    Meta:
    - ordering: Default ordering of instances by measurement_date in descending order.

    Methods:
    This model primarily serves as a data container with fields representing various measurements 
    and associated metadata. No specific methods are defined within the model itself.
    """
    
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    session_id = models.IntegerField(default=1)
    shot_id = models.IntegerField(default=1)
    measurement_date = models.DateTimeField(auto_now_add=True)
    gravity_center = models.JSONField()
    quaternion = models.JSONField()
    sliders_value = models.JSONField()

    class Meta:
        ordering = ['-measurement_date']
