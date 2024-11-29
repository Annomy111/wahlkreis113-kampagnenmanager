import React from 'react';
import { ListItem, Box, Typography, Avatar } from '@mui/material';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const ChatMessage = ({ message, isOwnMessage }) => {
  const { userName, content, timestamp } = message;
  const formattedTime = format(new Date(timestamp), 'HH:mm', { locale: de });

  return (
    <ListItem
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        p: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isOwnMessage ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          gap: 1,
          maxWidth: '70%',
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: isOwnMessage ? 'primary.main' : 'secondary.main',
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </Avatar>

        <Box>
          <Box
            sx={{
              backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
              color: isOwnMessage ? 'white' : 'text.primary',
              borderRadius: 2,
              p: 1,
              maxWidth: '100%',
              wordBreak: 'break-word',
            }}
          >
            {!isOwnMessage && (
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 0.5 }}
              >
                {userName}
              </Typography>
            )}
            <Typography variant="body1">{content}</Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: isOwnMessage ? 'right' : 'left',
              mt: 0.5,
              color: 'text.secondary',
            }}
          >
            {formattedTime}
          </Typography>
        </Box>
      </Box>
    </ListItem>
  );
};

export default ChatMessage;
