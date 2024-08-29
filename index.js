const express = require('express');
const app = express()
const fs=require('fs');
const path=require('path');

let usersPath = path.join(__dirname,'users.json');
app.use(express.json());

//route for displaying name of the app
app.get('/', function (req, res) {
    res.status(200).send("<center><h1>Multi User To Do App!</h1></center>");
  })

//route for displaying current list of users
app.get('/users', function (req, res) {
    //retrieving the list of users from users.json file
    fs.readFile(usersPath, 'utf8', (err, data) => {
        //Case where file does not exist
        if (err) {
            return res.status(404).send('Not able to retrieve list of users!');
        }

        //If the users.json file is empty        
        if(!data)
        {
            return res.status(200).send("<center><h1>Empty List(Currently No Users)!</h1></center>");
        }
        
        //Sending the list of exisiting users
        let users=[];
        
        if(data)
         {
           users=JSON.parse(data);
         }
         let renderData=users[0].name + "<br><br>";
         for(let i=1;i<users.length;i++)
         {
           renderData=renderData+users[i].name + "<br><br>";
         }
        
        res.status(200).send(`<center><h1>List of Users!</h1><br><br>${renderData}</center>`);
    });
})

//route to create a new user
app.post('/create-user', function (req, res) {

    //If no username is provided in the request
    if(!req.body.name)
    {
        res.status(400).send("Please provide your username to register!");
    }
    else
    {  
        //Retrieve the list of users
        let users=[];
        
        const data=fs.readFileSync(usersPath,"utf-8");
        if(data)
         {
           users=JSON.parse(data);
         }
        
        //Chacking if username already exists
        const userIndex = users.findIndex(user => user.name === req.body.name);
        //Negative index means no user with entered username exisis so will create a new user
        if(userIndex<0)
        {
            const user ={
               name: req.body.name
            }
            users.push(user);
            //Separate file to store user specific todos will autometically created when a new 
            //user is created
            let userPath=path.join(__dirname,'/usersData/'+user.name+'.json')
            fs.writeFileSync(userPath, '');

            //Converting to Json and writing back to users.json file 
            const jsonData = JSON.stringify(users, null, 2);
    
            fs.writeFile(usersPath,jsonData,(err,data)=>
            {
                if(err)
                {
                    return res.status(404).send('Error writing to the JSON file or Json File not Present!');
                }
                else
                {
                    return res.status(200).send(`Successfully created a user with name ${user.name}`);
                }
                
            });
        }
        //Duplicate entry, asks user to send another request with unique username
        else
        {
            return res.status(200).send(`Already a user present with name ${req.body.name}, Please select a unique username`);
        }
        
    }
    
})

//Route to delete a user
app.delete('/delete-user/:username', function (req, res) {

    //Chaeking if username to delete exists  
    let users=[];
    const data=fs.readFileSync(usersPath,"utf-8");
    if(data)
    {
        users=JSON.parse(data);
    }
    const userIndex = users.findIndex(user => user.name === req.params.username);
    
    //Case where provided username does not exist
    if(userIndex<0)
    {
         res.status(404).send(`There is no any user presnt with username ${req.params.username}`);
    }
    //Case where provided username exists
    else
    {
        let userPath=path.join(__dirname,'/usersData/'+users[userIndex].name+'.json')
        //Deleting the user as well the file associated with the user
        users.splice(userIndex,1);
        fs.unlinkSync(userPath);

        const jsonData = JSON.stringify(users, null, 2);
        
        fs.writeFile(usersPath,jsonData,(err,data)=>
        {
            if(err)
            {
                return res.status(404).send('Error writing to the JSON file or Json File not Present!');
            }
            else
            {
                return res.status(200).send(`Successfully deleted an user with username ${req.params.username}`);
            }
            
        });   
    }
})

//route to retrieve list of todos for an specific user
app.get('/retrieve-todos/:username', function (req, res) {
    
    //Checking if the username provided in the request exists.
    let users=[];
    const data=fs.readFileSync(usersPath,"utf-8");
    if(data)
    {
        users=JSON.parse(data);
    }
    const userIndex = users.findIndex(user => user.name === req.params.username);

    if(userIndex<0)
    {
         res.status(404).send(`There is no any user presnt with username ${req.params.username}`);
    }
    else
    {
        let filePath = path.join(__dirname,'/usersData/'+req.params.username+'.json');
        fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).send('Error reading the JSON file or Json File Not present!');
        }

        if(!data)
        {
            return res.send("<center><h1>Empty To-do List!</h1></center>");
        }

        let todos=[];
        
        if(data)
         {
           todos=JSON.parse(data);
         }
         let renderData=todos[0].id + ". " + todos[0].title+"<br><br>";
         for(let i=1;i<todos.length;i++)
         {
           renderData=renderData+todos[i].id + ". " +todos[i].title+"<br><br>";
         }
        
        res.status(200).send(`<center><h1>Todos List!</h1><br><br>${renderData}</center>`);
    });
    }

})

//route to create list of todos for an specific user
app.post('/create-todo/:username', function (req, res) {
    
    //Checking if the username provided in the request exists.
    let users=[];
    const data=fs.readFileSync(usersPath,"utf-8");
    if(data)
    {
        users=JSON.parse(data);
    }
    const userIndex = users.findIndex(user => user.name === req.params.username);

    if(userIndex<0)
    {
         res.status(404).send(`There is no any user presnt with username ${req.params.username}`);
    }

    else
    {
        let filePath = path.join(__dirname,'/usersData/'+req.params.username+'.json');
        if(!req.body.description || !req.body.id)
        {
            res.status(400).send("Can't add an Empty todo!");
        }
        else
        {  
            let todos=[];
            const data=fs.readFileSync(filePath,"utf-8");
            if(data)
             {
               todos=JSON.parse(data);
             }
            
            const todoIndex = todos.findIndex(todo => todo.id === req.body.id);
            if(todoIndex<0)
            {
                const todo ={
                    title: req.body.description,
                    id: req.body.id
                }
                todos.push(todo);
        
                const jsonData = JSON.stringify(todos, null, 2);
        
                fs.writeFile(filePath,jsonData,(err,data)=>
                {
                    if(err)
                    {
                        return res.status(404).send('Error writing to the JSON file or Json File not Present!');
                    }
                    else
                    {
                        return res.status(200).send(`Successfully created a todo with id ${todo.id}`);
                    }
                    
                });
            }
            else
            {
                return res.send(`Already a todo present with id ${req.body.id}`);
            }
            
        }
    }  
    
})

//route to update list of todos for an specific user
app.put('/update-todo/:username/:idx', function (req, res) {
    
    //Checking if the username provided in the request exists.
    let users=[];
    const data=fs.readFileSync(usersPath,"utf-8");
    if(data)
    {
        users=JSON.parse(data);
    }
    const userIndex = users.findIndex(user => user.name === req.params.username);

    if(userIndex<0)
    {
         res.status(404).send(`There is no any user presnt with username ${req.params.username}`);
    }
    else
    {
    let filePath = path.join(__dirname,'/usersData/'+req.params.username+'.json');
    const idx = parseInt(req.params.idx, 10); 

    let todos=[];
    const data=fs.readFileSync(filePath,"utf-8");
    if(data)
    {
        todos=JSON.parse(data);
    }
    const todoIndex = todos.findIndex(todo => todo.id === idx);
     
    if(todoIndex<0)
    {
        res.status(404).send(`There is no any todo presnt with id ${idx}`);
    }
    else if(!req.body.title)
    {
        res.status(400).send("Please provide the content to update this todo!");
    }
    else
    {
        todos[todoIndex].title = req.body.title;
        const jsonData = JSON.stringify(todos, null, 2);

        fs.writeFile(filePath,jsonData,(err,data)=>
        {
            if(err)
            {
                return res.status(404).send('Error writing to the JSON file or Json File not Present!');
            }
            else
            {
                return res.status(200).send(`Successfully updated the todo with id ${idx}`);
            }
            
        }); 
        
    }
    }
    

    
        
});

//route to update list of todos for an specific user
app.delete('/delete-todo/:username/:idx', function (req, res) {

    //Checking if the username provided in the request exists.
    let users=[];
    const data=fs.readFileSync(usersPath,"utf-8");
    if(data)
    {
        users=JSON.parse(data);
    }
    const userIndex = users.findIndex(user => user.name === req.params.username);

    if(userIndex<0)
    {
         res.status(404).send(`There is no any user presnt with username ${req.params.username}`);
    }
    else
    {
        const idx = parseInt(req.params.idx, 10);
        let filePath = path.join(__dirname,'/usersData/'+req.params.username+'.json');
    
        let todos=[];
        const data=fs.readFileSync(filePath,"utf-8");
        if(data)
        {
            todos=JSON.parse(data);
        }
        const todoIndex = todos.findIndex(todo => todo.id === idx);
    
        if(todoIndex<0)
        {
             res.status(404).send(`There is no any todo presnt with id ${idx}`);
        }
        else
        {
            todos.splice(todoIndex,1);
            const jsonData = JSON.stringify(todos, null, 2);
    
            fs.writeFile(filePath,jsonData,(err,data)=>
            {
                if(err)
                {
                    return res.status(404).send('Error writing to the JSON file or Json File not Present!');
                }
                else
                {
                    return res.status(200).send(`Successfully deleted a todo with id ${idx}`);
                }
                
            });   
        }
    }
    
    
})

app.listen(3000);