"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms"); //Para usar el reactive Forms debemos importar esto.
var customer_1 = require("./customer");
require("rxjs/add/operator/debounceTime"); //Esta importacion nos va a servir para que al momento que el usuario este escribiendo , el sistema espere un momento que el usuairo deje de escribir para luego mostrarle el error
/////////////////////////////////////////// ----------------------------- Validacion de grupos ---------------------------------------------///////////////////////////////
function emailMatcher(c) {
    var emailControl = c.get('email'); //Obtenemos el formControl del email
    var confirmControl = c.get('confirmEmail'); //Obtenemos el formControl del Confirmemail
    if (emailControl.pristine || confirmControl.pristine) {
        return null; //Si uno de los dos no ha sido tocado que no devuelva un error sino un null indicado que no hay error aun 
    }
    if (emailControl.value === confirmControl.value) {
        return null; //Si ambos son iguales cruzara bien la validacion
    }
    return { 'match': true }; //De lo contrario va agregar un error de nombre match, indicando que tiene un error, pero ese error lo tendra el formGroup directamente , no los formControlers
}
////////////////////////////////////////////------------------------------Custom Validation con parametros -----------------------------------////////////////////////////////////////////////
function ratingRangeParam(min, max) {
    return function (c) {
        if (c.value != undefined && (isNaN(c.value) || c.value < min || c.value > max)) {
            return { 'range': true }; //Esto se agrega al arreglo de errores del formControl y podemos manejar el range desde el Html
        }
        return null; //De lo contrario devolvera un null que indica que no hay problema
    };
}
////////////////////////////////////////////------------------------------Custom Validation sin parametros -----------------------------------////////////////////////////////////////////////
function ratingRange(c) {
    if (c.value != undefined && (isNaN(c.value) || c.value < 1 || c.value > 5)) {
        return { 'range': true }; //Esto se agrega al arreglo de errores del formControl y podemos manejar el range desde el Html
    }
    return null; //De lo contrario devolvera un null que indica que no hay problema
}
var CustomerComponent = (function () {
    function CustomerComponent(fb) {
        this.fb = fb;
        this.customer = new customer_1.Customer(); //El modelo o la clase Customer
        this.validationMessages = {
            required: 'Please enter your email address.',
            pattern: 'Please enter a valid email address.'
        };
    }
    Object.defineProperty(CustomerComponent.prototype, "addresses", {
        get: function () {
            return this.customerForm.get('addresses'); //Le hacemos un get a ese arreglo que tenemos en el FormGroup o grupo principal
        },
        enumerable: true,
        configurable: true
    });
    CustomerComponent.prototype.ngOnInit = function () {
        var _this = this;
        console.log(this.customerForm);
        //============================= Forma corta  ==========================================//
        this.customerForm = this.fb.group({
            firstName: ['', [forms_1.Validators.required, forms_1.Validators.minLength(3)]],
            lastName: ['', [forms_1.Validators.required, forms_1.Validators.maxLength(50)]],
            emailGroup: this.fb.group({
                email: ['', [forms_1.Validators.required, forms_1.Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
                confirmEmail: ['', forms_1.Validators.required],
            }, { validator: emailMatcher }),
            phone: '',
            notificacion: 'email',
            rating: ['', ratingRange],
            //rating: ['', ratingRangeParam(1,5)],//ratingRange es el custom validation que hicimos arriba con parametros
            sendCtalog: true,
            addresses: this.fb.array([this.buildAddress()]) //Esta funcion lo que hace es la instancia del FormGroup y no lo tenemos que definir todo aqui, con el form Array podemos hacer un arreglo con todas las funciones que querramos, esto se usa tambien para duplicar datos de entrada
        });
        this.customerForm.get('notificacion').valueChanges //El valueChanges retorna un Observable es por eso que nos subscirbimos, con este podemos ver todos los valores que se pongan en ese input y lo que esta sujto cuando cambia
            .subscribe(function (value) { return _this.setNotifications(value); });
        var emailControl = this.customerForm.get('emailGroup.email'); //le asignamos al emailControl este FormControl para no tener que estar escribieno codigo muy largo
        emailControl.valueChanges.debounceTime(1000).subscribe(function (value) {
            return _this.setMessage(emailControl);
        }); //La funcion setMessage determinara el mensaje de validacion apropiado para mostrar                
        // =================================  Este es la forma larga   =================================//  
        // Ojo con lo que hacemos aqui no estamos manejando data si no mas bien enlazandola con la plantilla  //
        //    this.customerForm = new FormGroup({
        //          firstName: new FormControl(),//Aqui le creamos el control a esa variable para poder enlazarla con la plantilla
        //          lastName: new FormControl(),
        //          email: new FormControl(),
        //          sendCtalog: new FormControl(true)//Aqui le pasamos un parametro porque queremos que tenga un valor por defecto
        //    });//Creamos una instancia, lo podemos hacer en el constructor como aqui
    };
    CustomerComponent.prototype.populateTestData = function () {
        this.customerForm.setValue({
            firstName: 'Dominic',
            lastName: 'Minaya',
            emailGroup: 'dominicminaya03@gmail.com',
            confirmEmail: '',
            phone: 8095672889,
            notificacion: 'text',
            rating: '',
            sendCtalog: false
        });
    };
    CustomerComponent.prototype.populateTest = function () {
        this.customerForm.patchValue({
            firstName: 'Dominic',
            lastName: 'Minaya',
            sendCtalog: false
        });
    };
    CustomerComponent.prototype.save = function () {
        console.log(this.customerForm); //Visualizamos que estamos recibiendo
        console.log('Saved: ' + JSON.stringify(this.customerForm.value)); //Lo mostramos en formatp JSON
    };
    CustomerComponent.prototype.addAddress = function () {
        this.addresses.push(this.buildAddress());
    };
    CustomerComponent.prototype.buildAddress = function () {
        return this.fb.group({
            addressType: 'home',
            street1: '',
            street2: '',
            city: '',
            state: '',
            zip: ''
        });
    };
    CustomerComponent.prototype.setMessage = function (c) {
        var _this = this;
        this.emailMessage = ''; //Tenemos que limpiarlo primero , debido a que el cambio mas reciente en el elemento de entrada, puede hacer todas las reglas de validacion para aprobar, y no quueremos los mensajes sobrantes mostrando.
        if ((c.touched || c.dirty) && c.errors) {
            this.emailMessage = Object.keys(c.errors).map(function (key) {
                return _this.validationMessages[key];
            }).join('');
        }
    };
    CustomerComponent.prototype.setNotifications = function (value) {
        var phoneControl = this.customerForm.get('phone'); //Agarramos los Form del phone  
        if (value === 'text') {
            phoneControl.setValidators(forms_1.Validators.required); //Si el valor que recibimos es igual a (text) pues seteamos en el phone control que ese campo debe ser requerido con el (setValidators)
        }
        else {
            phoneControl.clearValidators(); //De lo contrario limpia las validaciones
        }
        phoneControl.updateValueAndValidity(); //Esto se usa despues de ajustar o eliminar validaciones
    };
    return CustomerComponent;
}());
CustomerComponent = __decorate([
    core_1.Component({
        selector: 'my-signup',
        templateUrl: './app/customers/customer.component.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder])
], CustomerComponent);
exports.CustomerComponent = CustomerComponent;
//# sourceMappingURL=customer.component.js.map