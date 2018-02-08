# chatterbox-client
This is a project I completed as a student at [hackreactor](http://hackreactor.com). This project was worked on with a pair.

Built a chat client for communicating with fellow students using $.ajax to send and fetch JSON data to and from a remote server.

## High Level Goals of this Sprint
* Increase vocabulary and understanding around Hypertext Transfer Protocol
* Successfully implement a request-response based chat application using JavaScript
* Gain experience interacting with a REST API (in this case the Parse REST API)
* Gain exposure to common Browser Security themes

## Key HTTP Vocabulary
* [Request-Response Communication](https://en.wikipedia.org/wiki/Request%E2%80%93response)
* The [HTTP Session section](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#HTTP_session) of Wikipedia's [Hypertext Transfer Protocol page](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol)
* The [Request Methods section](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods) of Wikipedia's [Hypertext Transfer Protocol page](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol)
* List of [HTTP Status Codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes). Don't read this entirely, but at least look into what each of the NXX (e.g. 1XX, 2XX) sections mean.
* Read all about [Cross-site-scripting](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)).

## Tools
* ES6
* Package Manager [Bower](https://bower.io/)
* [Parse API](http://docs.parseplatform.org/rest/guide/)

The message objects you send to the parse server (via POST requests) should be in the following format:
```javascript
var message = {
  username: 'shawndrost',
  text: 'trololo',
  roomname: '4chan'
};
```

To get you started, here's an example POST request. Note that any messages you POST to the server are viewable by everyone, so be nice.
```javascript
$.ajax({
  // This is the url you should use to communicate with the parse API server.
  url: 'http://parse.CAMPUS.hackreactor.com/chatterbox/classes/messages',
  type: 'POST',
  data: JSON.stringify(message),
  contentType: 'application/json',
  success: function (data) {
    console.log('chatterbox: Message sent');
  },
  error: function (data) {
    // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
    console.error('chatterbox: Failed to send message', data);
  }
});
```

## API Keys and Git
You should NEVER check in API Keys to version control. A common practice (which we adopt here) is to prevent that by storing our API keys in a special file config.js (referenced in client/index.html) that we add to our .gitignore so that it's never committed to our repo. This means that after you clone down the repo, before running the app, you must re-create that special file and add your API keys to it or the app won't run.

To make this easier and less prone to breakage, we create a dummy file (which we do commit) in the correct format, and add placeholders for the real data within it. In this application, that dummy file is located at client/env/config.example.js.

To get your application running with the real API keys, follow these steps:
* Duplicate client/env/config.example.js renaming it to client/env/config.js in the process.
* NOTE: You've now created the file referenced in client/index.html as client/env/config.js that your app requires in order to run.
* NOTE: client/env/config.js is also ignored in your .gitignore so that the API keys you add won't be committed.
* Replace the placeholder strings in your newly created client/env/config.js with the keys delivered by your Coordinator

## Bare minimum requirements
* Open up client/scripts/app.js and start coding.
* Note: The url you should be using is http://parse.CAMPUS.hackreactor.com/chatterbox/classes/messages where CAMPUS is your campus identifier (ex: atx, nyc, la, sfs, sfm6, sfm8, hrr, etc).
* Display messages retrieved from the parse server.
* Use proper escaping on any user input. Since you're displaying input that other users have typed, your app is vulnerable XSS attacks. See the section about escaping below.
* Note: If you issue an XSS attack, you must make it innocuous enough to be educational, rather than disruptive. Basically you should scope your attacks to be console.logs or minor style changes. The following are not allowed:
* alerts
* adding or removing dom elements
* auto-posting
* DDOS attacks
* Setup a way to refresh the displayed messages (either automatically or with a button)
* Allow users to select a user name for themself and to be able to send messages
* A note about escaping: Escaping is the way we ensure that when users input things to our sites, we don't allow them to write our site's code for us. For example, what if someone's user name was <script>$('body').prepend('you got pwned')</script>? If we didn't escape, that 'user name' would get executed just like any other code, and all the sudden you'll have a new div on your site that says 'you got pwned', anytime that person's user name is displayed. Now that might seem trivial, but understand that attacks like this can affect (or transmit) your users data too. That's not cool. You'll need to figure out a way to effectively protect your app against cross-site scripting (XSS) attacks issued by your class-mates during this sprint. Part of the fun of this sprint is figuring out how to do so. As always, google is your friend :). If you're curious, you can read about some of the nuances associated with escaping html here.
* Rooms - Allow users to create rooms and enter existing rooms - Rooms are defined by the .roomname property of messages, so you'll need to filter them somehow.
* Socializing - Allow users to 'befriend' other users by clicking on their user name
* Display all messages sent by friends in bold
