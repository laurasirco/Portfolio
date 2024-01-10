let currentSlide = 0
let slideCount = $(".holder div").length

let color = $(".holder div")[0].attributes.color.value
colorElements(color)

function colorElements(color){
    $("body").css("color", color)
    $("a").css("color", color)
    $("#logo").css("background", color)
    console.log($("a"))
}

let nextSlide = function(){
    currentSlide = currentSlide + 1

    if(currentSlide >= slideCount){
        currentSlide = 0
    }

    let vwUnit = -currentSlide * 100
    let leftPosition = vwUnit + "vw"

    let color = $(".holder div")[currentSlide].attributes.color.value

    $(".holder").css("left", leftPosition)

    colorElements(color)
}

let previousSlide = function(){
    currentSlide = currentSlide - 1

    if(currentSlide < 0){
        currentSlide = 0
    }

    let vwUnit = -currentSlide * 100
    let leftPosition = vwUnit + "vw"

    let color = $(".holder div")[currentSlide].attributes.color.value

    $(".holder").css("left", leftPosition)

    colorElements(color)
}


var autoSlide = setInterval(function(){

    nextSlide()
    
}, 6000)


$(".next").on("click", function(){
    clearInterval(autoSlide)
    nextSlide()
})

$(".prev").on("click", function(){
    clearInterval(autoSlide)
    previousSlide()
})