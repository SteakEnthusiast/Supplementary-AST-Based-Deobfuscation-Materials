if(!![]){
	console.log("This always runs! 1")
}

if (40 > 80){
	console.log("This never runs.")
}

![] ? console.log("This never runs.") : console.log("This always runs! 2") 

// Chained example

if (!![]){
	console.log("This always runs! 3")
  	![] ? console.log("This never runs.") : (false) ? console.log("This never runs") : (40 < 20) ? console.log("This never runs.") : 80 > 1 ? console.log("This always runs! 4") : 40 > 2 ? console.log("This never runs.")  : console.log("This never runs.")
}