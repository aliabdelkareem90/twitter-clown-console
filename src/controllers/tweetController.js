let Tweet = require('../models/tweet');
const Joi = require('joi');

class TweetController {
	constructor() {
		this.tweet = new Tweet;
	}

	createTweet(tweet) {
		const postSchema = Joi.object().keys({
			content: Joi.string().required().min(3),
			date: Joi.required(),
			uid: Joi.required()
		});

		Joi.validate({
			content: tweet.content,
			date: tweet.date,
			uid: tweet.uid,
		}, postSchema, (error, tweet) => {
			if (error) throw error
			this.tweet.store(tweet)
		})
	}

	showTweets(callback) {
		this.tweet.get((error, data) => {
			if (!error) {
				callback(data)
			}
		})
	}

	showOwnTweets(uid, callback) {
		this.tweet.getCurrentUserTweet(uid, (err, data) => {
			if (err) throw err
			else {
				callback(data)
			}
		})
	}
}

module.exports = TweetController

