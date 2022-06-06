if(!![]){
	console.log("This always runs! 1")
}else{
    console.log("This never runs.")
}

if (40 > 80){
	console.log("This never runs.")
}else if (1 < 2){
    console.log("This always runs! 2")
}else{
    console.log("This never runs.")
}

![] ? console.log("This never runs.") : console.log("This always runs! 3") 

// Chained example

if (!![]){
	console.log("This always runs! 4")
  	![] ? console.log("This never runs.") : (false) ? console.log("This never runs") : (40 < 20) ? console.log("This never runs.") : 80 > 1 ? console.log("This always runs! 5") : 40 > 2 ? console.log("This never runs.")  : console.log("This never runs.")
}else{
    console.log("This never runs.")
}