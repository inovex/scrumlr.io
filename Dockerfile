FROM node:lts

# Default firebase configuration, should be overriden for your project setup
ENV REACT_APP_FIREBASE_API_KEY=AIzaSyBcsvnI8T1fdNbDyipPQrK-rROIqtj8zT0
ENV REACT_APP_FIREBASE_AUTH_DOMAIN=scrumlr-dev.firebaseapp.com
ENV REACT_APP_DATABASE_URL=https://scrumlr-dev.firebaseio.com
ENV REACT_APP_PROJECT_ID=scrumlr-dev
ENV REACT_APP_FIREBASE_STORAGE_BUCKET=scrumlr-dev.appspot.com
ENV REACT_APP_FIREBASE_MESSAGING_SENDER_ID=411585721031

# Install dependencies
WORKDIR /usr/src/app
COPY . .
RUN npm install

# Start app on port :3000
EXPOSE 3000
CMD npm start