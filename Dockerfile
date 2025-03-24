FROM node:22

# Install gem sass for  grunt-contrib-sass
#RUN apt-get update -qq && apt-get install -y build-essential
#RUN apt-get install -y ruby
#RUN gem install sass

WORKDIR /home/pronouny

# Install Mean.JS Prerequisites
RUN npm install -g gulp
RUN npm install -g bower
RUN npm install -g forever

# Install Mean.JS packages
ADD package.json /home/pronouny/package.json
ADD .bowerrc /home/pronouny/.bowerrc
ADD bower.json /home/pronouny/bower.json
RUN echo '{ "allow_root": true }' > /root/.bowerrc
RUN npm install

# Manually trigger bower. Why doesnt this work via npm install?


RUN bower install --config.interactive=false

# Make everything available for start
ADD . /home/pronouny

# And build the app
RUN gulp build

ENV PORT=3000
EXPOSE 3000
CMD ["forever", "server.js"]
