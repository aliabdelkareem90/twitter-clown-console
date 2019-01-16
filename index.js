let program = require('commander');
let firebase = require('./src/firebase')
let UserConfig = require('./src/userConfig')
let { prompt } = require('inquirer');
let { loginQuestions, registerQuestions, tweetQuestions, commentQuestions, tweetListQuestions, tweetControlQuestions } = require('./src/questions');
let UserController = require('./src/controllers/userController');
let TweetController = require('./src/controllers/tweetController');
let CommentController = require('./src/controllers/commentController');
let TimeAgo = require('javascript-time-ago')
let en = require('javascript-time-ago/locale/en')
TimeAgo.addLocale(en)
const timeAgo = new TimeAgo('en-US')

// Login
program
    .command('login')
    .alias('l')
    .description('Login a user')
    .action(() => {
        prompt(loginQuestions).then(answers => {
            let userController = new UserController();
            let { email, password } = answers;
            userController.login(email, password, (error, data) => {
                if (!error) {
                    UserConfig.setLogin(data.uid)
                    console.log("login successfully")
                }
            })
        })
    });

// Register
program
    .command('register')
    .alias('r')
    .description('Create new user')
    .action(() => {
        UserConfig.checkLogin((uid) => {
            if (!uid) {
                prompt(registerQuestions).then(answers => {
                    let userController = new UserController();
                    userController.register(answers)
                })
            } else {
                console.log("you are login !")
            }
        })
    });

// Logout
program
    .command('logout')
    .alias('lo')
    .description('Logaout')
    .action(() => {
        UserConfig.checkLogin((uid) => {
            if (uid) {
                UserConfig.logout((uid) => {
                    console.log("logout successfully")
                })
            } else {
                console.log("you are not login !")
            }
        })
    });


// Create a new tweet
program
    .command('tweet')
    .alias('tw')
    .description('Create Tweet')
    .action(() => {
        UserConfig.checkLogin((uid) => {
            if (uid) {
                prompt(tweetQuestions).then(answers => {
                    answers.uid = uid
                    answers.date = Date.now()
                    let tweetController = new TweetController();
                    tweetController.createTweet(answers)
                })
            } else {
                console.log("you are not login !")
            }
        })
    });


// Show All Tweets
program
    .command('home')
    .alias('h')
    .description('Show all Tweets')
    .action(() => {
        UserConfig.checkLogin((uid) => {
            if (uid) {
                let tweetController = new TweetController();
                tweetController.showTweets((tw) => {
                    let tweets = []
                    tw.forEach(function (doc) {
                        tweets.push(doc.data().content + "\t (" + timeAgo.format(doc.data().date) + ") \n" + doc.id)
                    });
                    prompt(tweetListQuestions(tweets)).then((answers) => {
                        let id = answers.id.split("\n")[1]
                        prompt(tweetControlQuestions(tweets)).then((answers) => {
                            let commentController = new CommentController();
                            if (answers.control == 'New Comment') {
                                
                                prompt(commentQuestions).then((answers) => {
                                    answers.tweetId = id
                                    answers.uid = uid
                                    commentController.createComment(answers)
                                })
                            }
                            if(answers.control == 'Show Comments'){
                                commentController.showComments(id);
                            }
                        })
                    })
                })

            } else {
                console.log("you are not login !")
            }
        })
    });

// Show current user's tweets(profile)
program
    .command('profile')
    .alias('p')
    .description('Show user\'s tweets')
    .action(() => {
        UserConfig.checkLogin(uid => {
            if (uid) {
                let tweetController = new TweetController
                tweetController.showOwnTweets(twt => {
                    let myTweets =[]
                    twt.forEach(doc => {
                        myTweets.push(doc.data().content + "\t (" + timeAgo.format(doc.data().date) + ") \n" + doc.id)
                    })
                    prompt(tweetListQuestions(myTweets)).then((answers) => {
                        let id = answers.id.split("\n")[1]
                        prompt(tweetControlQuestions(myTweets)).then((answers) => {
                            let commentController = new CommentController();
                            if (answers.control == 'New Comment') {

                                prompt(commentQuestions).then((answers) => {
                                    answers.tweetId = id
                                    answers.uid = uid
                                    commentController.createComment(answers)
                                })
                            }
                            if (answers.control == 'Show Comments') {
                                commentController.showComments(id);
                            }
                        })
                    })
                })
            } else {
                console.log("you are not login !")
            }
        })
    })

program.parse(process.argv);
