---
created: 2024-03-10T17:37:46 (UTC +08:00)
tags: []
source: https://docs.dhtmlx.com/gantt/desktop__howtostart_nodejs.html
author: 
---

# dhtmlxGantt with Node.js Gantt Docs

> ## Excerpt
> The current tutorial is intended for creating Gantt with Node.js and REST API on the server side. 
If you use some other technology, check the list of available integration variants below:

---
The current tutorial is intended for creating Gantt with Node.js and REST API on the server side. If you use some other technology, check the list of available integration variants below:

-   [dhtmlxGantt with ASP.NET Core](https://docs.dhtmlx.com/gantt/desktop__howtostart_dotnet_core.html)
-   [dhtmlxGantt with ASP.NET MVC](https://docs.dhtmlx.com/gantt/desktop__howtostart_dotnet.html)
-   [dhtmlxGantt with Python](https://docs.dhtmlx.com/gantt/desktop__howtostart_python.html)
-   [dhtmlxGantt with PHP: Laravel](https://docs.dhtmlx.com/gantt/desktop__howtostart_php_laravel.html)
-   [dhtmlxGantt with PHP:Slim](https://docs.dhtmlx.com/gantt/desktop__howtostart_php_slim4.html)
-   [dhtmlxGantt with Salesforce LWC](https://docs.dhtmlx.com/gantt/desktop__howtostart_salesforce.html)
-   [dhtmlxGantt with Ruby on Rails](https://docs.dhtmlx.com/gantt/desktop__howtostart_ruby.html)

Our implementation of Gantt with Node.js will be based on REST API that will be used for communication with a server. Node.js has a set of ready-made solutions, so we won't have to code everything from the very beginning. We will also use MySQL as a data storage.

You can have a look at the video guide that shows how to create a Gantt chart using Node.js.

<iframe width="704" height="400" src="https://www.youtube.com/embed/D8YzyzBfyP8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>

## Step 1. Creating a project

To begin with, we'll create a project folder and then add the required dependencies. We'll make use of the following modules:

-   [Express](http://expressjs.com/) - a tiny framework for Node.js
-   [body-parser](https://www.npmjs.com/package/body-parser) - a Node.js parsing tool

So, let's create a project folder and name it "dhx-gantt-app":

```
<pre>mkdir dhx<span>-</span>gantt<span>-</span>app
cd dhx<span>-</span>gantt<span>-</span>app</pre>
```

### Adding the dependencies

Now we will create the _package.json_ file. We'll specify the dependencies in it with the following command:

```
<pre>npm init <span>-</span>y</pre>
```

When the file is ready, open it and put the above listed dependencies into it. The result will look similar to this one:

package.json

```
<pre><span>{</span>
  <span>"name"</span><span>:</span> <span>"dhx-gantt-app"</span><span>,</span>
  <span>"version"</span><span>:</span> <span>"1.0.2"</span><span>,</span>
  <span>"description"</span><span>:</span> <span>""</span><span>,</span>
  <span>"main"</span><span>:</span> <span>"server.js"</span><span>,</span>
  <span>"dependencies"</span><span>:</span> <span>{</span>
    <span>"body-parser"</span><span>:</span> <span>"^1.19.1"</span><span>,</span>
    <span>"express"</span><span>:</span> <span>"^4.17.2"</span>
  <span>}</span><span>,</span>
  <span>"scripts"</span><span>:</span> <span>{</span>
    <span>"test"</span><span>:</span> <span>"echo <span>\"</span>Error: no test specified<span>\"</span> &amp;&amp; exit 1"</span><span>,</span>
    <span>"start"</span><span>:</span> <span>"node server.js"</span>
  <span>}</span><span>,</span>
  <span>"keywords"</span><span>:</span> <span>[</span><span>]</span><span>,</span>
  <span>"author"</span><span>:</span> <span>""</span><span>,</span>
  <span>"license"</span><span>:</span> <span>"MIT"</span>
<span>}</span></pre>
```

Finally, we need to install the added dependencies using the command below:

```
<pre>npm install</pre>
```

### Preparing the backend

We'll follow a basic [express](https://expressjs.com/) setup: we'll have a single js file for our app backend (let's call it "server.js"), a folder for static files (named "public") and a single html page.

The whole project structure will be as follows:

```
<pre>dhx-gantt-app
├── node_modules
├── server.js 
├── package.json 
└── public 
    └── index.html</pre>
```

Create a new file named **server.js** and add the following code into it:

server.js

```
<pre><span>const</span> express <span>=</span> require<span>(</span><span>'express'</span><span>)</span><span>;</span>
<span>const</span> bodyParser <span>=</span> require<span>(</span><span>'body-parser'</span><span>)</span><span>;</span>
<span>const</span> path <span>=</span> require<span>(</span><span>'path'</span><span>)</span><span>;</span>
&nbsp;
<span>const</span> port <span>=</span> <span>1337</span><span>;</span>
<span>const</span> app <span>=</span> express<span>(</span><span>)</span><span>;</span>
&nbsp;
app.<span>use</span><span>(</span>express.<span>static</span><span>(</span>path.<span>join</span><span>(</span>__dirname<span>,</span> <span>"public"</span><span>)</span><span>)</span><span>)</span><span>;</span>
app.<span>use</span><span>(</span>bodyParser.<span>urlencoded</span><span>(</span><span>{</span> extended<span>:</span> <span>true</span> <span>}</span><span>)</span><span>)</span><span>;</span>
&nbsp;
app.<span>listen</span><span>(</span>port<span>,</span> <span>(</span><span>)</span> <span>=&gt;</span><span>{</span>
    console.<span>log</span><span>(</span><span>"Server is running on port "</span><span>+</span>port<span>+</span><span>"..."</span><span>)</span><span>;</span>
<span>}</span><span>)</span><span>;</span></pre>
```

What we have done in this code:

-   defined that static files will be served from the 'public' folder
-   attached the application to 1337 port of the localhost

On the next step we will create the "public" folder. This folder will contain the main page of our application - _index.html_.

This folder is also the right place to put js/css files of dhtmlxGantt. However, in this tutorial we're going to load gantt from CDN, so we'll only have an html page there.

## Step 2. Adding Gantt to the page

Let's create the _public_ folder and add an _index.html_ file into it. Then open the _index.html_ file and fill it with the following content:

index.html

```
<pre><span>&lt;!DOCTYPE html&gt;</span>
<span>&lt;<span>head</span>&gt;</span>
  <span>&lt;<span>meta</span> <span>http-equiv</span><span>=</span><span>"Content-type"</span> <span>content</span><span>=</span><span>"text/html; charset=utf-8"</span>&gt;</span>
&nbsp;
  <span>&lt;<span>script</span> <span>src</span><span>=</span><span>"https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.js"</span>&gt;&lt;<span>/</span><span>script</span>&gt;</span>
  <span>&lt;<span>link</span> <span>href</span><span>=</span><span>"https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.css"</span> <span>rel</span><span>=</span><span>"stylesheet"</span>&gt;</span>
&nbsp;
  <span>&lt;<span>style</span> <span>type</span><span>=</span><span>"text/css"</span>&gt;</span><pre>    html<span>,</span> body<span>{</span>
      <span>height</span><span>:</span><span>100%</span><span>;</span>
      <span>padding</span><span>:</span><span>0px</span><span>;</span>
      <span>margin</span><span>:</span><span>0px</span><span>;</span>
      <span>overflow</span><span>:</span> <span>hidden</span><span>;</span>
    <span>}</span></pre>
  <span>&lt;<span>/</span><span>style</span>&gt;</span>
<span>&lt;<span>/</span><span>head</span>&gt;</span>
<span>&lt;<span>body</span>&gt;</span>
  <span>&lt;<span>div</span> <span>id</span><span>=</span><span>"gantt_here"</span> <span>style</span><span>=</span><span>'width:100%; height:100%;'</span>&gt;&lt;<span>/</span><span>div</span>&gt;</span>
  <span>&lt;<span>script</span> <span>type</span><span>=</span><span>"text/javascript"</span>&gt;</span><pre>    gantt.<span>init</span><span>(</span><span>"gantt_here"</span><span>)</span><span>;</span></pre>  <span>&lt;<span>/</span><span>script</span>&gt;</span>
<span>&lt;<span>/</span><span>body</span>&gt;</span></pre>
```

Let's check what we have got at the moment. Go to the project folder and run the following command from the command line:

```
<pre>node server.<span>js</span></pre>
```

Then open http://127.0.0.1:1337 in a browser. You should see a page with an empty gantt like the one shown here:

![](https://docs.dhtmlx.com/gantt/media/desktop/gantt_init.png)

## Step 3. Preparing a database

The next step is to create a database. We'll make a simple database with two tables for tasks and links:

```
<pre>CREATE TABLE `gantt_links` <span>(</span>
  `id` int<span>(</span><span>11</span><span>)</span> NOT <span>NULL</span> AUTO_INCREMENT<span>,</span>
  `source` int<span>(</span><span>11</span><span>)</span> NOT <span>NULL</span><span>,</span>
  `target` int<span>(</span><span>11</span><span>)</span> NOT <span>NULL</span><span>,</span>
  `type` varchar<span>(</span><span>1</span><span>)</span> NOT <span>NULL</span><span>,</span>
  PRIMARY KEY <span>(</span>`id`<span>)</span>
<span>)</span><span>;</span>
CREATE TABLE `gantt_tasks` <span>(</span>
  `id` int<span>(</span><span>11</span><span>)</span> NOT <span>NULL</span> AUTO_INCREMENT<span>,</span>
  `text` varchar<span>(</span><span>255</span><span>)</span> NOT <span>NULL</span><span>,</span>
  `start_date` datetime NOT <span>NULL</span><span>,</span>
  `duration` int<span>(</span><span>11</span><span>)</span> NOT <span>NULL</span><span>,</span>
  `progress` float NOT <span>NULL</span><span>,</span>
  `parent` int<span>(</span><span>11</span><span>)</span> NOT <span>NULL</span><span>,</span>
  PRIMARY KEY <span>(</span>`id`<span>)</span>
<span>)</span><span>;</span></pre>
```

and add some test data:

```
<pre>INSERT INTO `gantt_tasks` VALUES <span>(</span><span>'1'</span><span>,</span> <span>'Project #1'</span><span>,</span> <span>'2017-04-01 00:00:00'</span><span>,</span> 
  <span>'5'</span><span>,</span> <span>'0.8'</span><span>,</span> <span>'0'</span><span>)</span><span>;</span>
INSERT INTO `gantt_tasks` VALUES <span>(</span><span>'2'</span><span>,</span> <span>'Task #1'</span><span>,</span> <span>'2017-04-06 00:00:00'</span><span>,</span> 
  <span>'4'</span><span>,</span> <span>'0.5'</span><span>,</span> <span>'1'</span><span>)</span><span>;</span>
INSERT INTO `gantt_tasks` VALUES <span>(</span><span>'3'</span><span>,</span> <span>'Task #2'</span><span>,</span> <span>'2017-04-05 00:00:00'</span><span>,</span> 
  <span>'6'</span><span>,</span> <span>'0.7'</span><span>,</span> <span>'1'</span><span>)</span><span>;</span>
INSERT INTO `gantt_tasks` VALUES <span>(</span><span>'4'</span><span>,</span> <span>'Task #3'</span><span>,</span> <span>'2017-04-07 00:00:00'</span><span>,</span> 
  <span>'2'</span><span>,</span> <span>'0'</span><span>,</span> <span>'1'</span><span>)</span><span>;</span>
INSERT INTO `gantt_tasks` VALUES <span>(</span><span>'5'</span><span>,</span> <span>'Task #1.1'</span><span>,</span> <span>'2017-04-05 00:00:00'</span><span>,</span> 
  <span>'5'</span><span>,</span> <span>'0.34'</span><span>,</span> <span>'2'</span><span>)</span><span>;</span>
INSERT INTO `gantt_tasks` VALUES <span>(</span><span>'6'</span><span>,</span> <span>'Task #1.2'</span><span>,</span> <span>'2017-04-11 13:22:17'</span><span>,</span> 
  <span>'4'</span><span>,</span> <span>'0.5'</span><span>,</span> <span>'2'</span><span>)</span><span>;</span>
INSERT INTO `gantt_tasks` VALUES <span>(</span><span>'7'</span><span>,</span> <span>'Task #2.1'</span><span>,</span> <span>'2017-04-07 00:00:00'</span><span>,</span>
  <span>'5'</span><span>,</span> <span>'0.2'</span><span>,</span> <span>'3'</span><span>)</span><span>;</span>
INSERT INTO `gantt_tasks` VALUES <span>(</span><span>'8'</span><span>,</span> <span>'Task #2.2'</span><span>,</span> <span>'2017-04-06 00:00:00'</span><span>,</span> 
  <span>'4'</span><span>,</span> <span>'0.9'</span><span>,</span> <span>'3'</span><span>)</span><span>;</span></pre>
```

Check a detailed example [here](https://docs.dhtmlx.com/gantt/desktop__loading.html#standarddatabasestructure).

## Step 4. Loading data

Now we need to implement data loading.

Since we use MySQL, we need to install necessary modules that we could use to access it. In this tutorial CRUD operations will be implemented based on the promises approach. So, we will use [promise-mysql](https://www.npmjs.com/package/promise-mysql) - a Node.js package for working with MySQL using promises and the [bluebird](https://www.npmjs.com/package/bluebird) promise library.

To install them we can use the console. We need to specify the following component versions as the newer ones aren't compatible with one another or don't have old functions:

```
<pre>npm install bluebird<span>@</span>3.7.2 <span>--</span>save
npm install promise<span>-</span>mysql<span>@</span>5.1.0 <span>--</span>save
npm install date<span>-</span>format<span>-</span>lite<span>@</span>17.7.0 <span>--</span>save</pre>
```

You can choose any other appropriate modules. The code is fairly simple and you can implement the same logic using a different set of tools.

The client side expects data in the [JSON format](https://docs.dhtmlx.com/gantt/desktop__supported_data_formats.html#json). So, we'll create a route which will return this kind of data.

As you've probably mentioned, there is the "start\_date" property in the data, which is kept as a date object. Therefore, it should be passed to the client in the proper format. For this purpose, we will use another module - [date-format-lite](https://github.com/litejs/date-format-lite).

```
<pre>npm install date<span>-</span>format<span>-</span>lite <span>--</span>save</pre>
```

Now you should open the _server.js_ file and update its code with the following:

server.js

```
<pre><span>const</span> express <span>=</span> require<span>(</span><span>'express'</span><span>)</span><span>;</span>
<span>const</span> bodyParser <span>=</span> require<span>(</span><span>'body-parser'</span><span>)</span><span>;</span>
<span>const</span> path <span>=</span> require<span>(</span><span>'path'</span><span>)</span><span>;</span>
&nbsp;
<span>const</span> port <span>=</span> <span>1337</span><span>;</span>
<span>const</span> app <span>=</span> express<span>(</span><span>)</span><span>;</span>
&nbsp;
app.<span>use</span><span>(</span>express.<span>static</span><span>(</span>path.<span>join</span><span>(</span>__dirname<span>,</span> <span>"public"</span><span>)</span><span>)</span><span>)</span><span>;</span>
app.<span>use</span><span>(</span>bodyParser.<span>urlencoded</span><span>(</span><span>{</span> extended<span>:</span> <span>true</span> <span>}</span><span>)</span><span>)</span><span>;</span>
&nbsp;
app.<span>listen</span><span>(</span>port<span>,</span> <span>(</span><span>)</span> <span>=&gt;</span><span>{</span>
    console.<span>log</span><span>(</span><span>"Server is running on port "</span><span>+</span>port<span>+</span><span>"..."</span><span>)</span><span>;</span>
<span>}</span><span>)</span><span>;</span>
&nbsp;
<span>const</span> Promise <span>=</span> require<span>(</span><span>'bluebird'</span><span>)</span><span>;</span>
require<span>(</span><span>"date-format-lite"</span><span>)</span><span>;</span>
&nbsp;
<span>const</span> mysql <span>=</span> require<span>(</span><span>'promise-mysql'</span><span>)</span><span>;</span>
async <span>function</span> serverСonfig<span>(</span><span>)</span> <span>{</span>
    <span>const</span> db <span>=</span> await mysql.<span>createPool</span><span>(</span><span>{</span>
        host<span>:</span> <span>'localhost'</span><span>,</span>
        user<span>:</span> <span>'root'</span><span>,</span>
        password<span>:</span> <span>''</span><span>,</span>
        database<span>:</span> <span>'gantt_howto_node'</span>
    <span>}</span><span>)</span><span>;</span>
    app.<span>get</span><span>(</span><span>"/data"</span><span>,</span> <span>(</span>req<span>,</span> res<span>)</span> <span>=&gt;</span> <span>{</span>
        Promise.<span>all</span><span>(</span><span>[</span>
            db.<span>query</span><span>(</span><span>"SELECT * FROM gantt_tasks"</span><span>)</span><span>,</span>
            db.<span>query</span><span>(</span><span>"SELECT * FROM gantt_links"</span><span>)</span>
        <span>]</span><span>)</span>.<span>then</span><span>(</span>results <span>=&gt;</span> <span>{</span>
            let tasks <span>=</span> results<span>[</span><span>0</span><span>]</span><span>,</span>
                links <span>=</span> results<span>[</span><span>1</span><span>]</span><span>;</span>
&nbsp;
            <span>for</span> <span>(</span>let i <span>=</span> <span>0</span><span>;</span> i <span>&lt;</span> tasks.<span>length</span><span>;</span> i<span>++</span><span>)</span> <span>{</span>
              tasks<span>[</span>i<span>]</span>.<span>start_date</span> <span>=</span> tasks<span>[</span>i<span>]</span>.<span>start_date</span>.<span>format</span><span>(</span><span>"YYYY-MM-DD hh:mm:ss"</span><span>)</span><span>;</span>
              tasks<span>[</span>i<span>]</span>.<span>open</span> <span>=</span> <span>true</span><span>;</span>
            <span>}</span>
&nbsp;
            res.<span>send</span><span>(</span><span>{</span>
                data<span>:</span> tasks<span>,</span>
                collections<span>:</span> <span>{</span> links<span>:</span> links <span>}</span>
            <span>}</span><span>)</span><span>;</span>
&nbsp;
        <span>}</span><span>)</span>.<span>catch</span><span>(</span>error <span>=&gt;</span> <span>{</span>
            sendResponse<span>(</span>res<span>,</span> <span>"error"</span><span>,</span> <span>null</span><span>,</span> error<span>)</span><span>;</span>
        <span>}</span><span>)</span><span>;</span>
    <span>}</span><span>)</span><span>;</span>
&nbsp;
    <span>function</span> sendResponse<span>(</span>res<span>,</span> action<span>,</span> tid<span>,</span> error<span>)</span> <span>{</span>
&nbsp;
        <span>if</span> <span>(</span>action <span>==</span> <span>"error"</span><span>)</span>
            console.<span>log</span><span>(</span>error<span>)</span><span>;</span>
&nbsp;
        let result <span>=</span> <span>{</span>
            action<span>:</span> action
        <span>}</span><span>;</span>
        <span>if</span> <span>(</span>tid <span>!==</span> undefined <span>&amp;&amp;</span> tid <span>!==</span> <span>null</span><span>)</span>
            result.<span>tid</span> <span>=</span> tid<span>;</span>
&nbsp;
        res.<span>send</span><span>(</span>result<span>)</span><span>;</span>
    <span>}</span>
<span>}</span><span>;</span>
serverСonfig<span>(</span><span>)</span><span>;</span></pre>
```

What we have done in this code:

-   opened MySql connection to our database
-   defined that on the **GET /data** request we'll read data from tasks and links tables and format them so they could be parsed on the client

Note that we've also added the _open_ property to ensure that the tasks tree will be initially expanded.

Now, we can call this route from the client:

public/index.html

```
<pre><span>gantt.<span>config</span>.<span>date_format</span> <span>=</span> <span>"%Y-%m-%d %H:%i:%s"</span><span>;</span></span>&nbsp;
gantt.<span>init</span><span>(</span><span>"gantt_here"</span><span>)</span><span>;</span>
&nbsp;
<span>gantt.<span>load</span><span>(</span><span>"/data"</span><span>)</span><span>;</span></span></pre>
```

Note that [date\_format](https://docs.dhtmlx.com/gantt/api__gantt_date_format_config.html) config specifies the format of dates (**start\_date** of the task) that comes from the server.

Let's run the application now by opening http://127.0.0.1:1337. The gantt will be loaded with the test data that we have previously added into the database.

![](https://docs.dhtmlx.com/gantt/media/desktop/load_data_nodejs.png)

## Step 5. Saving changes

The last thing that we should implement is data saving. For this we need a code that will send updates happening on the client side back to the server. Go to _public/index.html_ and add [gantt.dataProcessor](https://docs.dhtmlx.com/gantt/desktop__server_side.html#technique) to the page:

public/index.html

```
<pre>gantt.<span>config</span>.<span>date_format</span> <span>=</span> <span>"%Y-%m-%d %H:%i:%s"</span><span>;</span>
&nbsp;
gantt.<span>init</span><span>(</span><span>"gantt_here"</span><span>)</span><span>;</span>
&nbsp;
gantt.<span>load</span><span>(</span><span>"/data"</span><span>)</span><span>;</span>
&nbsp;
<span><span>const</span> dp <span>=</span> <span>new</span> gantt.<span>dataProcessor</span><span>(</span><span>"/data"</span><span>)</span><span>;</span></span><span>dp.<span>init</span><span>(</span>gantt<span>)</span><span>;</span></span><span>dp.<span>setTransactionMode</span><span>(</span><span>"REST"</span><span>)</span><span>;</span></span></pre>
```

Let's go deeper and see what role it plays.

### Requests and responses

On each user action: adding, changing or removing a new task or link, DataProcessor will react by sending an AJAX request to the corresponding URL. The request will contain all the parameters necessary for saving changes in the database.

Since DataProcessor is initialized in the REST mode, it will use different HTTP verbs for each type of operation. The list of HTTP verbs together with request and response details is given in the [Server-Side Integration](https://docs.dhtmlx.com/gantt/desktop__server_side.html#technique) article.

Well, what we need to do now is to add the required routes and handlers, that will put changes made on the client to the database, into the _server.js_ file. The resulting code will be rather spacious:

server.js

```
<pre><span>// add a new task</span>
app.<span>post</span><span>(</span><span>"/data/task"</span><span>,</span> <span>(</span>req<span>,</span> res<span>)</span> <span>=&gt;</span> <span>{</span>
    let task <span>=</span> getTask<span>(</span>req.<span>body</span><span>)</span><span>;</span>
&nbsp;
    db.<span>query</span><span>(</span><span>"INSERT INTO gantt_tasks(text, start_date, duration, progress, parent)"</span>
        <span>+</span> <span>" VALUES (?,?,?,?,?)"</span><span>,</span>
        <span>[</span>task.<span>text</span><span>,</span> task.<span>start_date</span><span>,</span> task.<span>duration</span><span>,</span> task.<span>progress</span><span>,</span> task.<span>parent</span><span>]</span><span>)</span>
    .<span>then</span><span>(</span>result <span>=&gt;</span> <span>{</span>
        sendResponse<span>(</span>res<span>,</span> <span>"inserted"</span><span>,</span> result.<span>insertId</span><span>)</span><span>;</span>
    <span>}</span><span>)</span>
    .<span>catch</span><span>(</span>error <span>=&gt;</span> <span>{</span>
        sendResponse<span>(</span>res<span>,</span> <span>"error"</span><span>,</span> <span>null</span><span>,</span> error<span>)</span><span>;</span>
    <span>}</span><span>)</span><span>;</span>
<span>}</span><span>)</span><span>;</span>
&nbsp;
<span>// update a task</span>
app.<span>put</span><span>(</span><span>"/data/task/:id"</span><span>,</span> <span>(</span>req<span>,</span> res<span>)</span> <span>=&gt;</span> <span>{</span>
    let sid <span>=</span> req.<span>params</span>.<span>id</span><span>,</span>
        task <span>=</span> getTask<span>(</span>req.<span>body</span><span>)</span><span>;</span>
&nbsp;
    db.<span>query</span><span>(</span><span>"UPDATE gantt_tasks SET text = ?, start_date = ?, "</span>
        <span>+</span> <span>"duration = ?, progress = ?, parent = ? WHERE id = ?"</span><span>,</span>
        <span>[</span>task.<span>text</span><span>,</span> task.<span>start_date</span><span>,</span> task.<span>duration</span><span>,</span> task.<span>progress</span><span>,</span> task.<span>parent</span><span>,</span> sid<span>]</span><span>)</span>
    .<span>then</span><span>(</span>result <span>=&gt;</span> <span>{</span>
        sendResponse<span>(</span>res<span>,</span> <span>"updated"</span><span>)</span><span>;</span>
    <span>}</span><span>)</span>
    .<span>catch</span><span>(</span>error <span>=&gt;</span> <span>{</span>
        sendResponse<span>(</span>res<span>,</span> <span>"error"</span><span>,</span> <span>null</span><span>,</span> error<span>)</span><span>;</span>
    <span>}</span><span>)</span><span>;</span>
<span>}</span><span>)</span><span>;</span>
&nbsp;
&nbsp;
<span>// delete a task</span>
app.<span>delete</span><span>(</span><span>"/data/task/:id"</span><span>,</span> <span>(</span>req<span>,</span> res<span>)</span> <span>=&gt;</span> <span>{</span>
    let sid <span>=</span> req.<span>params</span>.<span>id</span><span>;</span>
    db.<span>query</span><span>(</span><span>"DELETE FROM gantt_tasks WHERE id = ?"</span><span>,</span> <span>[</span>sid<span>]</span><span>)</span>
    .<span>then</span><span>(</span>result <span>=&gt;</span> <span>{</span>
        sendResponse<span>(</span>res<span>,</span> <span>"deleted"</span><span>)</span><span>;</span>
    <span>}</span><span>)</span>
    .<span>catch</span><span>(</span>error <span>=&gt;</span> <span>{</span>
        sendResponse<span>(</span>res<span>,</span> <span>"error"</span><span>,</span> <span>null</span><span>,</span> error<span>)</span><span>;</span>
    <span>}</span><span>)</span><span>;</span>
<span>}</span><span>)</span><span>;</span>
&nbsp;
<span>// add a link</span>
app.<span>post</span><span>(</span><span>"/data/link"</span><span>,</span> <span>(</span>req<span>,</span> res<span>)</span> <span>=&gt;</span> <span>{</span>
    let link <span>=</span> getLink<span>(</span>req.<span>body</span><span>)</span><span>;</span>
&nbsp;
    db.<span>query</span><span>(</span><span>"INSERT INTO gantt_links(source, target, type) VALUES (?,?,?)"</span><span>,</span>
        <span>[</span>link.<span>source</span><span>,</span> link.<span>target</span><span>,</span> link.<span>type</span><span>]</span><span>)</span>
    .<span>then</span><span>(</span>result <span>=&gt;</span> <span>{</span>
        sendResponse<span>(</span>res<span>,</span> <span>"inserted"</span><span>,</span> result.<span>insertId</span><span>)</span><span>;</span>
    <span>}</span><span>)</span>
    .<span>catch</span><span>(</span>error <span>=&gt;</span> <span>{</span>
        sendResponse<span>(</span>res<span>,</span> <span>"error"</span><span>,</span> <span>null</span><span>,</span> error<span>)</span><span>;</span>
    <span>}</span><span>)</span><span>;</span>
<span>}</span><span>)</span><span>;</span>
&nbsp;
<span>// update a link</span>
app.<span>put</span><span>(</span><span>"/data/link/:id"</span><span>,</span> <span>(</span>req<span>,</span> res<span>)</span> <span>=&gt;</span> <span>{</span>
    let sid <span>=</span> req.<span>params</span>.<span>id</span><span>,</span>
        link <span>=</span> getLink<span>(</span>req.<span>body</span><span>)</span><span>;</span>
&nbsp;
    db.<span>query</span><span>(</span><span>"UPDATE gantt_links SET source = ?, target = ?, type = ? WHERE id = ?"</span><span>,</span>
        <span>[</span>link.<span>source</span><span>,</span> link.<span>target</span><span>,</span> link.<span>type</span><span>,</span> sid<span>]</span><span>)</span>
    .<span>then</span><span>(</span>result <span>=&gt;</span> <span>{</span>
        sendResponse<span>(</span>res<span>,</span> <span>"updated"</span><span>)</span><span>;</span>
    <span>}</span><span>)</span>
    .<span>catch</span><span>(</span>error <span>=&gt;</span> <span>{</span>
        sendResponse<span>(</span>res<span>,</span> <span>"error"</span><span>,</span> <span>null</span><span>,</span> error<span>)</span><span>;</span>
    <span>}</span><span>)</span><span>;</span>
<span>}</span><span>)</span><span>;</span>
&nbsp;
<span>// delete a link</span>
app.<span>delete</span><span>(</span><span>"/data/link/:id"</span><span>,</span> <span>(</span>req<span>,</span> res<span>)</span> <span>=&gt;</span> <span>{</span>
    let sid <span>=</span> req.<span>params</span>.<span>id</span><span>;</span>
    db.<span>query</span><span>(</span><span>"DELETE FROM gantt_links WHERE id = ?"</span><span>,</span> <span>[</span>sid<span>]</span><span>)</span>
    .<span>then</span><span>(</span>result <span>=&gt;</span> <span>{</span>
        sendResponse<span>(</span>res<span>,</span> <span>"deleted"</span><span>)</span><span>;</span>
    <span>}</span><span>)</span>
    .<span>catch</span><span>(</span>error <span>=&gt;</span> <span>{</span>
        sendResponse<span>(</span>res<span>,</span> <span>"error"</span><span>,</span> <span>null</span><span>,</span> error<span>)</span><span>;</span>
    <span>}</span><span>)</span><span>;</span>
<span>}</span><span>)</span><span>;</span>
&nbsp;
&nbsp;
<span>function</span> getTask<span>(</span>data<span>)</span> <span>{</span>
    <span>return</span> <span>{</span>
        text<span>:</span> data.<span>text</span><span>,</span>
        start_date<span>:</span> data.<span>start_date</span>.<span>date</span><span>(</span><span>"YYYY-MM-DD"</span><span>)</span><span>,</span>
        duration<span>:</span> data.<span>duration</span><span>,</span>
        progress<span>:</span> data.<span>progress</span> <span>||</span> <span>0</span><span>,</span>
        parent<span>:</span> data.<span>parent</span>
    <span>}</span><span>;</span>
<span>}</span>
&nbsp;
<span>function</span> getLink<span>(</span>data<span>)</span> <span>{</span>
    <span>return</span> <span>{</span>
        source<span>:</span> data.<span>source</span><span>,</span>
        target<span>:</span> data.<span>target</span><span>,</span>
        type<span>:</span> data.<span>type</span>
    <span>}</span><span>;</span>
<span>}</span></pre>
```

We have created two sets of routes: one for the _tasks_ entity and another one for the _links_ one. Correspondingly, the _"/data/task"_ URL will serve for requests related to the operations with tasks and the _"/data/link"_ URL will be used to handle requests containing data for operations with links.

The requests types are pretty simple:

-   POST - to insert a new item into the database
-   PUT - to update an existing record
-   DELETE - to remove an item

The response will be a JSON object with the type of performed operation or "error" in case the code fails.

The response for the POST request will also contain the database id of the new record. It will be applied on the client side, so it will be possible to map a new item to the database entity.

That's all. Open http://127.0.0.1:1337 and you will see a fully operational gantt chart.

![](https://docs.dhtmlx.com/gantt/media/desktop/ready_gantt_nodejs.png)

## Storing the order of tasks

The client-side gantt allows [reordering tasks](https://docs.dhtmlx.com/gantt/desktop__reordering_tasks.html) using drag and drop. So if you use this feature, you'll have to store this order in the database. You can [check the common description here](https://docs.dhtmlx.com/gantt/desktop__server_side.html#storingtheorderoftasks).

Let's now add this feature to our app.

### Enable tasks reordering on the client

Firstly, we need to allow users to change the tasks order in the UI. Open the "Index" view and update the configuration of gantt:

public/index.html

```
<pre><span>gantt.<span>config</span>.<span>order_branch</span> <span>=</span> <span>true</span><span>;</span></span><span>gantt.<span>config</span>.<span>order_branch_free</span> <span>=</span> <span>true</span><span>;</span></span>&nbsp;
gantt.<span>init</span><span>(</span><span>"gantt_here"</span><span>)</span><span>;</span></pre>
```

Now, let's reflect these changes on the backend. We are going to store the order in the column named "sortorder", the updated _gantt\_tasks_ table declaration may look as follows:

```
<pre>CREATE TABLE `gantt_tasks` <span>(</span>
  `id` int<span>(</span><span>11</span><span>)</span> NOT <span>NULL</span>  AUTO_INCREMENT PRIMARY KEY<span>,</span>
  `text` varchar<span>(</span><span>255</span><span>)</span> COLLATE utf8_unicode_ci NOT <span>NULL</span><span>,</span>
  `start_date` datetime NOT <span>NULL</span><span>,</span>
  `duration` int<span>(</span><span>11</span><span>)</span> NOT <span>NULL</span><span>,</span>
  `progress` float NOT <span>NULL</span> <span>DEFAULT</span> <span>0</span><span>,</span>
  `parent` int<span>(</span><span>11</span><span>)</span> NOT <span>NULL</span><span>,</span>
<span>  `sortorder` int<span>(</span><span>11</span><span>)</span> NOT <span>NULL</span> </span><span>)</span> ENGINE<span>=</span>InnoDB <span>DEFAULT</span> CHARSET<span>=</span>utf8 COLLATE<span>=</span>utf8_unicode_ci<span>;</span></pre>
```

Or add the column to the table you already have:

```
<pre>ALTER TABLE `gantt_tasks` ADD COLUMN `sortorder` int<span>(</span><span>11</span><span>)</span> NOT <span>NULL</span><span>;</span></pre>
```

After that we need to update the _server.js_ file:

1 . **GET /data** must return tasks ordered by the `sortorder` column:

server.js

```
<pre>app.<span>get</span><span>(</span><span>"/data"</span><span>,</span> <span>(</span>req<span>,</span> res<span>)</span> <span>=&gt;</span> <span>{</span>
    Promise.<span>all</span><span>(</span><span>[</span>
<span>        db.<span>query</span><span>(</span><span>"SELECT * FROM gantt_tasks ORDER BY sortorder ASC"</span><span>)</span><span>,</span> </span>        db.<span>query</span><span>(</span><span>"SELECT * FROM gantt_links"</span><span>)</span>
    <span>]</span><span>)</span>.<span>then</span><span>(</span>results <span>=&gt;</span> <span>{</span>
        let tasks <span>=</span> results<span>[</span><span>0</span><span>]</span><span>,</span>
            links <span>=</span> results<span>[</span><span>1</span><span>]</span><span>;</span>
&nbsp;
        <span>for</span> <span>(</span>let i <span>=</span> <span>0</span><span>;</span> i <span>&lt;</span> tasks.<span>length</span><span>;</span> i<span>++</span><span>)</span> <span>{</span>
            tasks<span>[</span>i<span>]</span>.<span>start_date</span> <span>=</span> tasks<span>[</span>i<span>]</span>.<span>start_date</span>.<span>format</span><span>(</span><span>"YYYY-MM-DD hh:mm:ss"</span><span>)</span><span>;</span>
            tasks<span>[</span>i<span>]</span>.<span>open</span> <span>=</span> <span>true</span><span>;</span>
        <span>}</span>
&nbsp;
        res.<span>send</span><span>(</span><span>{</span>
            data<span>:</span> tasks<span>,</span>
            collections<span>:</span> <span>{</span> links<span>:</span> links <span>}</span>
        <span>}</span><span>)</span><span>;</span>
&nbsp;
    <span>}</span><span>)</span>.<span>catch</span><span>(</span>error <span>=&gt;</span> <span>{</span>
        sendResponse<span>(</span>res<span>,</span> <span>"error"</span><span>,</span> <span>null</span><span>,</span> error<span>)</span><span>;</span>
    <span>}</span><span>)</span><span>;</span>
<span>}</span><span>)</span><span>;</span></pre>
```

2 . Newly added tasks must receive the initial value `sortorder`:

server.js

```
<pre>app.<span>post</span><span>(</span><span>"/data/task"</span><span>,</span> <span>(</span>req<span>,</span> res<span>)</span> <span>=&gt;</span> <span>{</span> <span>// adds new task to database</span>
    let task <span>=</span> getTask<span>(</span>req.<span>body</span><span>)</span><span>;</span>
&nbsp;
    db.<span>query</span><span>(</span><span>"SELECT MAX(sortorder) AS maxOrder FROM gantt_tasks"</span><span>)</span>
<span>    .<span>then</span><span>(</span>result <span>=&gt;</span> <span>{</span>  </span>        <span>// assign max sort order to new task</span>
<span>        let orderIndex <span>=</span> <span>(</span>result<span>[</span><span>0</span><span>]</span>.<span>maxOrder</span> <span>||</span> <span>0</span><span>)</span> <span>+</span> <span>1</span><span>;</span> </span>        <span>return</span> db.<span>query</span><span>(</span><span>"INSERT INTO gantt_tasks(text, start_date, duration,"</span> 
          <span>+</span> <span>"progress, parent, sortorder) VALUES (?,?,?,?,?,?)"</span><span>,</span>
          <span>[</span>task.<span>text</span><span>,</span> task.<span>start_date</span><span>,</span> task.<span>duration</span><span>,</span> task.<span>progress</span><span>,</span> task.<span>parent</span><span>,</span> 
<span>            orderIndex<span>]</span><span>)</span><span>;</span> </span>    <span>}</span><span>)</span>
    .<span>then</span><span>(</span>result <span>=&gt;</span> <span>{</span>
        sendResponse<span>(</span>res<span>,</span> <span>"inserted"</span><span>,</span> result.<span>insertId</span><span>)</span><span>;</span>
    <span>}</span><span>)</span>
    .<span>catch</span><span>(</span>error <span>=&gt;</span> <span>{</span>
        sendResponse<span>(</span>res<span>,</span> <span>"error"</span><span>,</span> <span>null</span><span>,</span> error<span>)</span><span>;</span>
    <span>}</span><span>)</span><span>;</span>
<span>}</span><span>)</span><span>;</span></pre>
```

3 . Finally, when a user reorders tasks, task orders must be [updated](https://docs.dhtmlx.com/gantt/desktop__server_side.html#storingtheorderoftasks):

server.js

```
<pre><span>// update task</span>
app.<span>put</span><span>(</span><span>"/data/task/:id"</span><span>,</span> <span>(</span>req<span>,</span> res<span>)</span> <span>=&gt;</span> <span>{</span>
  let sid <span>=</span> req.<span>params</span>.<span>id</span><span>,</span>
    target <span>=</span> req.<span>body</span>.<span>target</span><span>,</span>
    task <span>=</span> getTask<span>(</span>req.<span>body</span><span>)</span><span>;</span>
&nbsp;
  Promise.<span>all</span><span>(</span><span>[</span>
    db.<span>query</span><span>(</span><span>"UPDATE gantt_tasks SET text = ?, start_date = ?,"</span> 
      <span>+</span> <span>"duration = ?, progress = ?, parent = ? WHERE id = ?"</span><span>,</span>
      <span>[</span>task.<span>text</span><span>,</span> task.<span>start_date</span><span>,</span> task.<span>duration</span><span>,</span> task.<span>progress</span><span>,</span> 
        task.<span>parent</span><span>,</span> sid<span>]</span><span>)</span><span>,</span>
<span>    updateOrder<span>(</span>sid<span>,</span> target<span>)</span> </span>  <span>]</span><span>)</span>
    .<span>then</span><span>(</span>result <span>=&gt;</span> <span>{</span>
      sendResponse<span>(</span>res<span>,</span> <span>"updated"</span><span>)</span><span>;</span>
    <span>}</span><span>)</span>
    .<span>catch</span><span>(</span>error <span>=&gt;</span> <span>{</span>
      sendResponse<span>(</span>res<span>,</span> <span>"error"</span><span>,</span> <span>null</span><span>,</span> error<span>)</span><span>;</span>
    <span>}</span><span>)</span><span>;</span>
<span>}</span><span>)</span><span>;</span>
&nbsp;
<span>function</span> updateOrder<span>(</span>taskId<span>,</span> target<span>)</span> <span>{</span>
  let nextTask <span>=</span> <span>false</span><span>;</span>
  let targetOrder<span>;</span>
&nbsp;
  target <span>=</span> target <span>||</span> <span>""</span><span>;</span>
&nbsp;
  <span>if</span> <span>(</span>target.<span>startsWith</span><span>(</span><span>"next:"</span><span>)</span><span>)</span> <span>{</span>
    target <span>=</span> target.<span>substr</span><span>(</span><span>"next:"</span>.<span>length</span><span>)</span><span>;</span>
    nextTask <span>=</span> <span>true</span><span>;</span>
  <span>}</span>
&nbsp;
  <span>return</span> db.<span>query</span><span>(</span><span>"SELECT * FROM gantt_tasks WHERE id = ?"</span><span>,</span> <span>[</span>target<span>]</span><span>)</span>
    .<span>then</span><span>(</span>result <span>=&gt;</span> <span>{</span>
      <span>if</span> <span>(</span><span>!</span>result<span>[</span><span>0</span><span>]</span><span>)</span>
        <span>return</span> Promise.<span>resolve</span><span>(</span><span>)</span><span>;</span>
&nbsp;
      targetOrder <span>=</span> result<span>[</span><span>0</span><span>]</span>.<span>sortorder</span><span>;</span>
      <span>if</span> <span>(</span>nextTask<span>)</span>
        targetOrder<span>++;</span>
&nbsp;
      <span>return</span> db.<span>query</span><span>(</span><span>"UPDATE gantt_tasks SET sortorder"</span><span>+</span>
        <span>" = sortorder + 1 WHERE sortorder &gt;= ?"</span><span>,</span> <span>[</span>targetOrder<span>]</span><span>)</span>
      .<span>then</span><span>(</span>result <span>=&gt;</span> <span>{</span>
        <span>return</span> db.<span>query</span><span>(</span><span>"UPDATE gantt_tasks SET sortorder = ? WHERE id = ?"</span><span>,</span>
          <span>[</span>targetOrder<span>,</span> taskId<span>]</span><span>)</span><span>;</span>
      <span>}</span><span>)</span><span>;</span>
    <span>}</span><span>)</span><span>;</span>
<span>}</span></pre>
```

You can check [a ready demo](https://github.com/DHTMLX/gantt-howto-node) on GitHub.

## Application security

Gantt doesn't provide any means of preventing an application from various threats, such as SQL injections or XSS and CSRF attacks. It is important that responsibility for keeping an application safe is on the developers implementing the backend. Read the details [in the corresponding article](https://docs.dhtmlx.com/gantt/desktop__app_security.html).

## Trouble shooting

In case you've completed the above steps to implement Gantt integration with Node.js, but Gantt doesn't render tasks and links on a page, have a look at the [Troubleshooting Backend Integration Issues](https://docs.dhtmlx.com/gantt/desktop__troubleshooting.html) article. It describes the ways of identifying the roots of the problems.

## What's next

Now you have a fully functioning gantt. You can view the full code on [GitHub](https://github.com/DHTMLX/gantt-howto-node), clone or download it and use it for your projects.

You can also check [guides on the numerous features of gantt](https://docs.dhtmlx.com/gantt/desktop__guides.html) or tutorials on [integrating Gantt with other backend frameworks](https://docs.dhtmlx.com/gantt/desktop__howtostart_guides.html).

[Back to top](https://docs.dhtmlx.com/gantt/desktop__howtostart_nodejs.html#top)
