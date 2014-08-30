/**
 * snapguide.js
 * 
 */

/**
 * Class representing the a row of thumbnails and a large image below it.
 * 
 * TODO: to support multiple instances of this on the same page we should
 * move the ids, e.g. #leftArrow, do be either a class or a data-attribute
 * so we don't have non-unique ids on the same page.
 * 
 * @param {String} scope - id of the element containing the guide 
 */
var Guide = function(scope) {
    this.leftArrow = document.querySelector(scope+' #leftArrow');
    this.rightArrow = document.querySelector(scope+' #rightArrow');
    this.topRowImages = document.querySelectorAll(scope+' #topRow img');
    this.bottomRowImage = document.querySelector(scope+' #bottomRow img');
    this.currentPage = 0;      
};

/**
 * Requests 5 additional thumbnails images based on an offset (currentPage)
 * and updates the topRowImages.
 */
Guide.prototype.imagesAJAXRequest = function() {
    var xhr = new XMLHttpRequest();
    var that = this;
    
    xhr.onload = function() {                
        var json = JSON.parse(xhr.responseText);
        var i;  
        var fadeInImage;
        
        // 1. Make the existing images fade out first
        for(i = 0; i < that.topRowImages.length; i++) {
            that.topRowImages[i].classList.remove('load');
        }
        
        /**
         * Closure which will incrementally update each thumbnail
         * after some increasing fixed interval.
         */
        fadeInImage = function(j) {            
            setTimeout(function() {
                var image = that.topRowImages[j];
                var smallUrl;
                var mediumUrl;
                var originalUrl;
                
                if(json[j]) {
                    smallUrl = json[j]['url_small'];
                    mediumUrl = json[j]['url_medium'];
                    originalUrl = json[j]['url'];   
                    
                    // Apply the fade in animation
                    image.classList.add('load');
                    image.setAttribute('src', smallUrl);
                    
                    // Populate some data-attributes that will
                    // be used if the user clicks on a thumbnail
                    image.setAttribute('data-medium', mediumUrl);
                    image.setAttribute('data-original', originalUrl);
                }
            }, j*100);
        };
        
        // 2. Make the new images fade in
        for(i = 0; i < that.topRowImages.length; i++) {                       
            fadeInImage(i);            
        }
    };
    xhr.open('GET', 'http://127.0.0.1:5000/small_images/'+this.currentPage);
    xhr.send();
};

/**
 * Set up the click handlers for the row of thumbnails and also
 * fade in the initial set of images
 */
Guide.prototype.setupTopRowClickHandlers = function() {
    var i;
    var that = this;
    
    for(i = 0; i < this.topRowImages.length; i++) {  
        
        // Fade in initial images
        this.topRowImages[i].classList.add('load');
        
        // Make the thumbnails clickable
        this.topRowImages[i].addEventListener('click', function(event) {
            var medium = event.currentTarget.getAttribute('data-medium');
            var original = event.currentTarget.getAttribute('data-original');
            
            // Update the large image
            that.bottomRowImage.setAttribute('src', medium);
            that.bottomRowImage.parentElement.setAttribute('href', original);
        });
    }
}

/**
 * Fade in the original large image
 */
Guide.prototype.animateInitialImages = function() {
    this.bottomRowImage.classList.add('load');
}

/**
 * Set up the click handlers for the previous and next buttons
 */
Guide.prototype.setupArrowClickHandlers = function() {    
    var that = this;
    
    this.leftArrow.addEventListener('click', function() {
        that.currentPage--;
        that.imagesAJAXRequest();
    });
    this.rightArrow.addEventListener('click', function() {
        that.currentPage++;
        that.imagesAJAXRequest();  
    });
}

/**
 * Call the appropriate functions on initial page load
 */
Guide.prototype.initialize = function() {
    this.animateInitialImages();
    this.setupTopRowClickHandlers();
    this.setupArrowClickHandlers();
}

var guide = new Guide('#guide-1');
guide.initialize();



