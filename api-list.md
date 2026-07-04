# devtinder api

AUTH ROUTER :
-post / signup
-post / login
-post / logout

PROFILE ROUTER:
-get /profile/view 
-patch /profile/edit // edits profile details    
-path /profile/password // only for forget password thing

CONNECTION REQUEST ROUTER:
-post /request/send/interested/:userID 
-post /request/send/ignored/:userID
-post /request/review/accepted/:requestID
-post /request/review/rejected/:requestID

USER ROUTER:
-get /connections  // friends
-get /request/recieved   // request pending to be accepted in our profile
-get /feed  // shows other users in homepage to swipe on them

status : ignored , interested , accepted , rejected