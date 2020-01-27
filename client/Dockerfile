FROM node:10

ADD ./jazz-widget-react jazz-widget-react

RUN npm install --prefix jazz-widget-react
RUN npm install -g serve
EXPOSE 5000

RUN npm run build --prefix jazz-widget-react
CMD serve -s ./jazz-widget-react/build 
