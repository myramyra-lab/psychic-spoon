var notes = document.querySelector('.topbar img');
var select = document.querySelector('.select');
var button = document.getElementsByTagName('button');
    for (var but of button)
    {
        //cart data count on button click
        but.addEventListener('click', (e)=>{
        e.preventDefault();
        var add = Number(notes.getAttribute('data-count') ||0);
        notes.setAttribute('data-count', add +1 );
        notes.classList.add('zero');

        //creating images on span div            
        var image=e.target.parentNode.querySelector('img');//the target property is a reference to the object onto which the event was dispatched. 
        var span=e.target.parentNode.querySelector('span');
        var newImage = image.cloneNode('true'); //this will create a copy of a node and returns the clone. If true, the node and its subtree will be copied. Otherwise only node will be cloned. 
        span.appendChild(newImage);
        span.classList.add('active');//classList property returns the class name of an element
        setTimeout(()=>{
            span.classList.remove('active');
            span.removeChild(newImage);
        }, 500);

        //copy and paste elements on select div
        var parent = e.target.parentNode;
        var clone = parent.cloneNode(true);
        select.appendChild(clone);
        clone.lastElementChild.innerText ="Buy Now";
        if(clone){
            notes.onclick =()=>{
                select.classList.toggle('display');
            };
        }
});
}
//to make the select div draggable
$(document).ready(function(){
    $(".select").draggable({
        containment: "parent",
        cursor: "grabbing",
        grid:[100,100],
        snap: true,
        snapTolerance: 30
    });
});
//to make calculations
(function($){
    $.Shop=function(element){
        this.$element = $(element);//top level element that wraps our entire DOM structure
        this.init();
    };
    $.Shop.prototype={
        init: function(){//initializes properties and methods
        }
    };
    $(function(){
        var shop = new $.Shop("#site"); //an instance of an object that contains data and behavior described by the class. The new operator instantiates the class. instance=newClass().
        console.log(shop.$element);
    });
})(jQuery);

$.Shop.prototype = {
    init: function(){
        this.cartPrefix = "shoes-";
        this.cartName = this.cartPrefix + "cart";
        this.shippingRates = this.cartPrefix + "shipping-rates";
        this.total=this.cartPrefix + "total";
        this.storage = sessionStorage;

        this.$formAddToCart = this.$element.find("form-add-to-cart");
        this.$formCart = this.$element.find("#shopping-cart");
        this.$checkoutCart = this.$element.find("#checkout-cart");
        this.$checkoutOrderForm = this.$element.find("#checkout-order-form");
        this.$shipping = this.$element.find("#sshipping");
        this.$subTotal = this.$element.find("#stotal");
        this.$shoppingCartActions = this.$element.find("#shopping-cart-actions");
        this.$updateCartBtn = this.$shoppingCartActions.find("#update-cart");
        this.emptyCartBtn = this.$shoppingCartActions.find("#empty-cart");
        this.$userDetails = this.$element.find("#user-details-content");
        this.$paypalForm = this.$element.find("#paypal-form");

        this.currency = "&shilling;";
        this.currencyString = "Ksh";
        this.paypalCurrency = "EUR";
        this.paypalBusinessEmail="yourbusiness@email.com";
        this.paypalURL="https://www.sandbox.paypal.com/cgi-bin/webscr";

        this.requiredFields ={
            expression: {
                // value: /^([w-.]+)@((?:[w]+.)+)([a-z]){2,4}$/
            },
            str:{
                value:""
            }
        };
    }
};
$.Shop.prototype={
    _emptyCart: function(){ //this private method empties the current session storage in the browser
        this.storage.clear();
        },
    _formatNumber: function(num, places){ //this method allows us to format a number by a set of decimal places. Its parameters include the number to be formatted and the number of decimal places.
            var n=num.toFixed(places);//this method will format the prices properly.
            return n; //it returns the formatted number.
        },
    _extractPrice: function(element){//we use this method to extract the numeric portion of a string from text nodes.This is because not all the prices in our pages are contained in data attributes. The element parameter is the jQuery parameter that contains the relevant string.  
        var self = this;//self is a reference to the $.Shop object. We need it every time we want to access a property or a method of our object without worrying about scope. 
        var text = element.text(); 
        // var text = $.trim(element.text()); The $.trim method removes all the white lines, spacesm and tabs from the beginning and end of a string. 
        var price = text.replace(self.currencyString, "").replace("", "");
        return price;
    },
    _convertString: function(numStr){//the parameter is the numeric string to be converted.
        var num;
        // if(/^[-+]?[0-9]+.[0-9]+$.test(numStr)){ //does the string have a decimal format
        //     num=parseFloat(numStr); 
        // }else if(/^d+$/.test(numStr)){ //does the string have an integer format
        //     num=parseInt(numStr);
        // }else { //if the format of the string cannot be detected, use the Number() constructor
        //     num=Number(numStr); 
        // }
        if (!isNaN(num)){ //tests if the result is a number
            return num;//returns the number or false if the string cannot be converted.
        }else {
            console.warn(numStr + "cannot be converted into a number");
            return false;
        }
    },
    _convertNumber: function(n){//the parameter is the number to be converted. 
        var str=n.toString();
        return str;
    },
    //the two methods below are needed because the cart will store information related to each product using the key-value format.  
    _toJSONObject: function(str){
        var obj = JSON.parse(str);
        return obj;
    },
    _toJSONString: function(obj){
        var str = JSON.stringify(obj);
        return str;
    },
    //the method below gets the cart's key from session storage,converts it into a JS object and adds a new object as a JSON string to the cart's array. 
    _addToCart: function(values){
        var cart = this.storage.getItem(this.cartName);
        var cartObject = this._toJSONObject(cart);
        var cartCopy=cartObject;
        var items = cartCopy.items;
        items.push(values);
        this.storage.setItem(this.cartName, this._toJSONString(cartCopy));
    }, 
    //shipping is calculated based on the overall number of products added to the cart.
    _calculateShipping: function(qty){
        var shipping=0;
        if(qty >= 6){
            shipping=10;
        }
        if(qty >= 12 && qty<=30){
            shipping=20;
        }
        if(qty >=30 && qty <=60){
            shipping=30;
        }
        if(qty>60){
            shipping = 100;
        }
        return shipping;
    }, 
    _validateForm:function(form){
        var self = this;
        var fields = self.requiredFields;
        var $visibleSet = form.find("fieldset: visible"); //we only want to take into account the fields contained in a fieldset element that is still visible after the user checks the visibility toggle. This is because when validation messages are added upon the form being submitted, we need to clear these messages before proceeding. 
        var valid=true;
        
        form.find(".message").remove();

        $visibleSet.each(function(){
            $(this).find(":input").each(function(){
                var $input = $(this);
                var type = $input.data("type");//validation takes place by checking whether the current field requires a simple string comparison or a regular expression test. Our tests are based on  the required fields property. If there is an error, we will show a message by using the data-message attribute of each field. 
                var msg = $input.data("message");
                
                if(type == "string"){
                    if("$input".value() == fields.str.value){
                        $("<span class='message'/>").text(msg).
                        insertBefore($input);
                        valid=false;                    }
                }
                else{
                    if(!fields.expression.value.test($input.val())){
                        $("<span class ='message'/>").text(msg).
                        insertBefore($input);
                        valid=false;
                    }
                }
            });
        });
        return valid;
    }, 
    //the method below also takes into account the visibility of fields based on user choice.
    _saveFormData: function(form){
        var self=this;
        var $visibleSet=form.find("fieldset:visible");

        $visibleSet.each(function(){
            var $set = $(this);
            if ($set.is("#fieldset-billing")){
                var name=$("#name", $set).val();
                var email=$("#email", $set).val();
                var city = $("#city", $set).val();
                var address=$("#address", $set).val();
                var zip=$("#zip", $set).val();
                var country=("#country", $set).val();

                self.storage.setItem("billing-name", name);
                self.storage.setItem("billing-email", email);
                self.storage.setItem("billing-city", city);
                self.storage.setItem("billing-address", address);
                self.storage.setItem("billing-zip", zip);
                self.storage.setItem("billing-country", country);
            } 
            else{
                var sName = $("#name", $set).val();
                var sEmail =$("#email".set).val();
                var sCity = $("#city", $set).val();
                var sAddress = $("#address", $set).val();
                var sZip = $("#zip", $set).val();
                var sCountry = $("#country", $set).val();

                self.storage.setItem("shipping-name", sName);
                self.storage.setItem("shipping-email", sEmail);
                self.storage.setItem("shipping-city", sCity);
                self.storage.setItem("shipping-Address", sAddress);
                self.storage.setItem("shipping-zip", sZip);
                self.storage.setItem("shipping-country", sCountry);

            }
        });
    }
};