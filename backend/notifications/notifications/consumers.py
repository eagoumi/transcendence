import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
import jwt
from django.conf import settings
from channels.db import database_sync_to_async
from app.models import Notification
from urllib.parse import parse_qs
from django.core.cache import cache

notif_user_channels = {}
logger = logging.getLogger(__name__)

# ███╗   ██╗ ██████╗ ████████╗██╗███████╗██╗ ██████╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗███████╗     ██████╗ ██████╗ ███╗   ██╗███████╗██╗   ██╗███╗   ███╗███████╗██████╗ 
# ████╗  ██║██╔═══██╗╚══██╔══╝██║██╔════╝██║██╔════╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝    ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║   ██║████╗ ████║██╔════╝██╔══██╗
# ██╔██╗ ██║██║   ██║   ██║   ██║█████╗  ██║██║     ███████║   ██║   ██║██║   ██║██╔██╗ ██║███████╗    ██║     ██║   ██║██╔██╗ ██║███████╗██║   ██║██╔████╔██║█████╗  ██████╔╝
# ██║╚██╗██║██║   ██║   ██║   ██║██╔══╝  ██║██║     ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║╚════██║    ██║     ██║   ██║██║╚██╗██║╚════██║██║   ██║██║╚██╔╝██║██╔══╝  ██╔══██╗
# ██║ ╚████║╚██████╔╝   ██║   ██║██║     ██║╚██████╗██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║███████║    ╚██████╗╚██████╔╝██║ ╚████║███████║╚██████╔╝██║ ╚═╝ ██║███████╗██║  ██║
# ╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚═╝╚═╝     ╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝     ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝

class notificationsConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.username = None

    async def connect(self):
        await self.accept()
        query_params = self._parse_query_params()
        token = query_params.get('token', [None])[0]
        try:
            self.username = self._decode_token(token)
            if not self.username:
                raise jwt.InvalidTokenError("Username not found in token")
            notif_user_channels[self.username] = self.channel_name
            logger.warning(f"User connected: {self.username}")
            await self.channel_layer.group_add(self.username, self.channel_name)
        except jwt.ExpiredSignatureError:
            await self.send_error_message('token_expired', 4001)
            logger.warning("Token expired")
        except jwt.InvalidTokenError as e:
            await self.send_error_message('invalid_token', 4002, str(e))
            logger.warning(f"Invalid token: {e}")
        
    async def receive(self, text_data):
        data = json.loads(text_data)
        logger.warning(f"Data received: {data}")
        message = data.get("message", "")
        users = data.get("users", [])
        link = data.get("link", "")
        logger.warning(f"users: {users}")
        logger.warning(f"user_channels: {notif_user_channels}")
        for user in users:
            logger.warning(f"User: {user}")
            notif = await self.create_notification(message, user, link)
            if user in notif_user_channels:
                logger.warning(f"Sending notification to user: {user}")
                await self.channel_layer.send(notif_user_channels[user], {
                    "type": "notification",
                    "id": notif.id,
                    "message": message,
                    "link": link,
                    "created_at": str(notif.created_at)
                })
            else:
                logger.warning(f"User {user} not found in notif_user_channels")
        if (message == "Notifications viewed"):
            await self.mark_notifications_as_read()
        # else:
        #     await self.broadcast_message(message)
    
    async def broadcast_message(self, message):
        logger.warning(f"Broadcasting message: {message}")
        await self.channel_layer.send(notif_user_channels[self.username], {
            "type": "notification",
            "message": message
        })

    @database_sync_to_async
    def create_notification(self, message, user, link):
        notification = Notification.objects.create(message=message, user=user, link=link)
        return notification
    
    @database_sync_to_async
    def mark_notifications_as_read(self):
        Notification.objects.update(read=True)
        logger.warning(f"Notifications marked as read for user: {self.username}")
        return True

    async def notification(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'id': event.get('id', ''),
            'message': message,
            'link': event.get('link', ''),
            'created_at': event.get('created_at', '')
        }))

    async def disconnect(self, code):
        if self.username:
            notif_user_channels.pop(self.username, None)
            await self.channel_layer.group_discard(self.username, self.channel_name)
    
    def _parse_query_params(self):
        query_string = self.scope['query_string'].decode()
        return parse_qs(query_string)
    
    def _decode_token(self, token):
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        username = payload.get('username')
        if not username:
            raise jwt.InvalidTokenError("Username not found in token.")
        return username
    
    async def send_error_message(self, error_type, code, message=None):
        logger.warning(f"{error_type}: {message}")
        await self.send(text_data=json.dumps({'type': error_type, 'message': message}))
        await self.close(code=code)
