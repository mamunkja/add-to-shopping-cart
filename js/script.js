//get UI elements
let form = document.querySelector('#add_form');
let productlist = document.querySelector('#product-list');
let addToCartlist = document.querySelector('#add-to-cart-list');

//Product class
class Product{
    constructor(name, price, id){
        this.name = name;
        this.price = price;
        this.id = id;
    }
}

// UI class
class UI{
    
    //add product to table list as tr
    static addProductlist(product) {
        let list = document.querySelector('#product-list');
        let row = document.createElement('tr');
        row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.id}</td>
        <td><a href='#' id='delete-product' class='delete'>X</a></td>
        <td><a href='#' class='button button-primary'>Add to Cart</a></td>`;

        list.appendChild(row);        
    }

    static addToCart(target) {
        let prod = {};

        let ele = target.parentElement.parentElement;
        prod.name = ele.children[0].textContent.trim();
        prod.price = ele.children[1].textContent.trim();
        prod.id = ele.children[2].textContent.trim();
        UI.addCartProductsIntoList(prod);        
    }

    static addCartProductsIntoList(product) {
        let list = document.querySelector('#add-to-cart-list');
        let row = document.createElement('tr');
        row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.id}</td>
        <td><a href='#' id='remove-from-cart' class='button button-primary'>Remove</a></td>`;
        list.appendChild(row);        
    }

    static showAlert(message, className){
        let div = document.createElement('div');
        div.className = `alert ${className}`;
        div.appendChild(document.createTextNode(message));

        let cont = document.querySelector('.container');
        let form = document.querySelector('#product');
        cont.insertBefore(div, form);

        setTimeout(() => {
            document.querySelector('.alert').remove();
        }, 3000);
    }

    static deleteProduct(target) {
        if (target.hasAttribute('href')){
            let element = target.parentElement;

            //check whether clicked from delete or add to cart button
            //if attribute 'id' exists then it is for delete
            if(target.hasAttribute('id')) {
                if(confirm('Are you sure to delete')){
                    element.parentElement.remove();
                    Store.removeProduct(element.previousElementSibling.textContent.trim());
                    UI.showAlert('Product deleted successfully', 'success');
                }
            } else {
                //add to cart
                let id = element.parentElement.children[2].textContent.trim();
                if(Store.addToCart(id)) {
                    UI.addToCart(target);
                    //Store.addToCart(id);                    
                    UI.showAlert('Product Added to cart successfully', 'success');
                } else {
                    UI.showAlert('Product already added to Cart!', 'error');
                }                
            }            
        }        
    }    

    static deleteFromCart(target) {
        if (target.hasAttribute('href')){
            let element = target.parentElement;
            if(confirm('Are you sure to delete')){
                element.parentElement.remove();
                Store.removeProductFromCart(element.previousElementSibling.textContent.trim());
                UI.showAlert('Product from Cart deleted successfully', 'success');
            }
        }
    }

    //clear all input fields
    static clearFields() {
        document.querySelector('#name').value = '';
        document.querySelector('#price').value = '';
        document.querySelector('#product_id').value = '';
    }
}

//class for local storage
class Store {
    
    static getProducts() {
        let products;
        if(localStorage.getItem('products') === null){
            products = [];
        } else {
            products = JSON.parse(localStorage.getItem('products'));
        }
        return products;
    }

    static getAddCartProducts() {
        let products;
        if(localStorage.getItem('addtocart') === null){
            products = [];
        } else {
            products = JSON.parse(localStorage.getItem('addtocart'));
        }
        return products;
    }

    //store product in local storage
    static addProduct(product) {
        let products = Store.getProducts();
        products.push(product);        
        localStorage.setItem('products', JSON.stringify(products));
    }

    static addToCart(id) {
        let products = Store.getProducts();
        let ret = true;
        
        products.forEach((product, index) => {
            if(product.id === id){
                //check whether the product id exists in adtocart local storage
                let addCartProducts = Store.getAddCartProducts();
                let productIdExists = false;
                addCartProducts.forEach((cartProduct, index) => {
                    if(cartProduct.id === id){
                        productIdExists = true;
                        ret = false;                        
                    }
                }); 
                //if product not exists in local storage then insert 
                if(!productIdExists) {
                    addCartProducts.push(product);
                    localStorage.setItem('addtocart', JSON.stringify(addCartProducts));
                }                       
            } 
        });
        return ret;
    }

    static removeProduct(id){
        let products = Store.getProducts();
        
        products.forEach((product, index) => {
            if(product.id === id){
                products.splice(index, 1);
            }
        });
        
        localStorage.setItem('products', JSON.stringify(products));    
    }

    static removeProductFromCart(id){
        let products = Store.getAddCartProducts();
        
        products.forEach((product, index) => {
            if(product.id === id){
                products.splice(index, 1);
            }
        });
        
        localStorage.setItem('addtocart', JSON.stringify(products));    
    }

    static displayProducts() {
        let products = Store.getProducts();

        products.forEach(product => {
            UI.addProductlist(product);
        })
    }

    static displayCartProducts() {
        let products = Store.getAddCartProducts();
        
        products.forEach(product => {
            UI.addCartProductsIntoList(product);
        })
    }
}

form.addEventListener('submit', newProduct);
productlist.addEventListener('click', removeProduct);
document.addEventListener('DOMContentLoaded', Store.displayProducts);
addToCartlist.addEventListener('click', removeCartProduct);
document.addEventListener('DOMContentLoaded', Store.displayCartProducts);

function newProduct(e) {
    //get the value from input fields
    let name = document.querySelector('#name').value.trim(),
    price = document.querySelector('#price').value.trim(),
    id = document.querySelector('#product_id').value.trim();

    if(name === '' || price === '' || id === ''){
        UI.showAlert('Please fill up all the fields!', 'error');
    } else {
        let product = new Product(name, price, id);
    
        UI.addProductlist(product);
        
        Store.addProduct(product);
        
        UI.clearFields();    

        UI.showAlert('Product added successfully', 'success');
    }
    
    e.preventDefault();
}

function removeProduct(params) {
    UI.deleteProduct(params.target);
    params.preventDefault();
}    

function removeCartProduct(params) {
    UI.deleteFromCart(params.target);
    params.preventDefault();
}