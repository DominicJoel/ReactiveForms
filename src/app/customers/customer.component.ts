import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormControlName, Validators, FormBuilder, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';//Para usar el reactive Forms debemos importar esto.

import { Customer } from './customer';
import 'rxjs/add/operator/debounceTime';//Esta importacion nos va a servir para que al momento que el usuario este escribiendo , el sistema espere un momento que el usuairo deje de escribir para luego mostrarle el error

/////////////////////////////////////////// ----------------------------- Validacion de grupos ---------------------------------------------///////////////////////////////

 function emailMatcher(c:AbstractControl):{[key:string]: boolean} | null  {

      let emailControl = c.get('email');//Obtenemos el formControl del email
      let confirmControl = c.get('confirmEmail');//Obtenemos el formControl del Confirmemail
     
       if (emailControl.pristine || confirmControl.pristine){
        return null; //Si uno de los dos no ha sido tocado que no devuelva un error sino un null indicado que no hay error aun 
       }

      if(emailControl.value === confirmControl.value){
          return null; //Si ambos son iguales cruzara bien la validacion
      }
      return { 'match':true }//De lo contrario va agregar un error de nombre match, indicando que tiene un error, pero ese error lo tendra el formGroup directamente , no los formControlers
 }



////////////////////////////////////////////------------------------------Custom Validation con parametros -----------------------------------////////////////////////////////////////////////

function ratingRangeParam(min : number , max:number):ValidatorFn {//Para recibir parametrsos solo hacenmos otra funcion que reciba los parametros y que sea de tipo (ValidatorFn)
   
    return  (c:AbstractControl):{[key:string]: boolean} | null =>  { //Esto retorna el codigo que esta abajo y debemos utilizar funcion de flecha
             
        if(c.value != undefined && (isNaN(c.value) || c.value < min || c.value > max )) { //Si el valor que estamos recibiendo no es un numero, o es mayor a 5 o menor a 1 devolvera un objeto de nombre range y valor true
            return { 'range': true }//Esto se agrega al arreglo de errores del formControl y podemos manejar el range desde el Html
        }
          
        return null //De lo contrario devolvera un null que indica que no hay problema
    }
}
////////////////////////////////////////////------------------------------Custom Validation sin parametros -----------------------------------////////////////////////////////////////////////
function ratingRange(c:AbstractControl):{[key:string]: boolean} | null { //Esta es una funcion para hacer nuestro custom Validators o validaciones que podamos manejar a nuestro antojo , si devuelve null indica que esta todo bn de lo contrario si devuelve un objeto lo convertira a booleano dando a entender que no paso la validacion
         
    if(c.value != undefined && (isNaN(c.value) || c.value < 1 || c.value > 5 )) { //Si el valor que estamos recibiendo no es un numero, o es mayor a 5 o menor a 1 devolvera un objeto de nombre range y valor true
        return { 'range': true }//Esto se agrega al arreglo de errores del formControl y podemos manejar el range desde el Html
    }
      
    return null //De lo contrario devolvera un null que indica que no hay problema
}


@Component({
    selector: 'my-signup',
    templateUrl: './app/customers/customer.component.html'
})
export class CustomerComponent implements OnInit {

    customerForm: FormGroup; //Variable de tipo FormGroup, Nuestra plantilla se unira a esta propiedad para asociar el codigo HTML.
    customer: Customer= new Customer();//El modelo o la clase Customer
    emailMessage: string;//Este va a tener el mensaje de validacion para mostrar a los usuarios

     
     get addresses():FormArray{
         return <FormArray>this.customerForm.get('addresses');  //Le hacemos un get a ese arreglo que tenemos en el FormGroup o grupo principal
     }

     private validationMessages = {//Esto lo vamos a utililizar para controlar los msj de error , asi que esta estructura define la lista de todos los mensajes de validacion disponibles para un formControl en particular 
         required: 'Please enter your email address.',//Definimos las reglas de validacion como pares clave y valor, donde la clave es el nombre de la regla de validacion y el valor es la cadena de texto que queremos mostrar
         pattern: 'Please enter a valid email address.'
     }
    
    constructor( private fb: FormBuilder )//El FormBuilder es para sustituir todas las instancias no tendremos que escribir new FormControl
    {

    } 

    ngOnInit(): void{

        console.log(this.customerForm);
       //============================= Forma corta  ==========================================//
        this.customerForm = this.fb.group({
                     firstName: ['', [ Validators.required , Validators.minLength(3) ]],//Cuando lo hacemos con el form group podemos validar por aqui lo que debe respetar y de esa forma lo quitamos de HTML, primero setiamos el valor por defecto y luego sus validaciones si llevan 
                     lastName: ['', [ Validators.required, Validators.maxLength(50)] ],
                     emailGroup: this.fb.group({//Esto lo creamos cuando un componente depende directamente de otro en este caso validadcion de que sea el mismo correo
                          email: ['', [Validators.required ,  Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
                          confirmEmail: ['', Validators.required],
                     },{validator: emailMatcher}),//Le pasamos al fb de los email la funcion que creamos arriba para la validacion del email, debemos pasarla como si fuera un objeto
                     phone: '',
                     notificacion: 'email',
                     rating: ['', ratingRange],//ratingRange es el custom validation que hicimos arriba
                     //rating: ['', ratingRangeParam(1,5)],//ratingRange es el custom validation que hicimos arriba con parametros
                     sendCtalog:true,
                     addresses : this.fb.array([this.buildAddress()]) //Esta funcion lo que hace es la instancia del FormGroup y no lo tenemos que definir todo aqui, con el form Array podemos hacer un arreglo con todas las funciones que querramos, esto se usa tambien para duplicar datos de entrada
               });
            
        this.customerForm.get('notificacion').valueChanges//El valueChanges retorna un Observable es por eso que nos subscirbimos, con este podemos ver todos los valores que se pongan en ese input y lo que esta sujto cuando cambia
                         .subscribe( value => this.setNotifications(value) );        
   


        const emailControl = this.customerForm.get('emailGroup.email');//le asignamos al emailControl este FormControl para no tener que estar escribieno codigo muy largo
             
              emailControl.valueChanges.debounceTime(1000).subscribe( value => //Nos subscribimos al valueChanges del formControl, el (debounceTime) nos permitira que el evento no se dispare de inmediato sino que espere un segundo o la cantidad de tiempo que querramos sin que el usuario escriba para disparar el error
                     this.setMessage(emailControl)) //La funcion setMessage determinara el mensaje de validacion apropiado para mostrar                

      // =================================  Este es la forma larga   =================================//  

    // Ojo con lo que hacemos aqui no estamos manejando data si no mas bien enlazandola con la plantilla  //
    //    this.customerForm = new FormGroup({
    //          firstName: new FormControl(),//Aqui le creamos el control a esa variable para poder enlazarla con la plantilla
    //          lastName: new FormControl(),
    //          email: new FormControl(),
    //          sendCtalog: new FormControl(true)//Aqui le pasamos un parametro porque queremos que tenga un valor por defecto

    //    });//Creamos una instancia, lo podemos hacer en el constructor como aqui
    }
 
        populateTestData(){
           
         this.customerForm.setValue({//El setValue se usa para actualizar los valores del formGroup, pero al momento de usarlo tenemos que darle valor a todos los form control
                    firstName: 'Dominic',
                    lastName:  'Minaya',
                    emailGroup: 'dominicminaya03@gmail.com',
                    confirmEmail: '',
                    phone:8095672889,
                    notificacion:'text',
                    rating: '',
                    sendCtalog: false
            });
        }
     
         populateTest(): void{
               
                this.customerForm.patchValue({//El patchValue se usa para actualizar los valores del formGroup, a diferencia del setValue aqui podemos indicar a los formControl que queremos que nos cambie el valor
                           firstName: 'Dominic',
                           lastName:  'Minaya',
                           sendCtalog: false
                   });
               }
    
         save() {
                console.log(this.customerForm);//Visualizamos que estamos recibiendo
                console.log('Saved: ' + JSON.stringify(this.customerForm.value));//Lo mostramos en formatp JSON
            }
          
         addAddress(): void{ //Para añadir al arreglo (addresses) que esta en el customerForm, un (buildAddress())
              this.addresses.push(this.buildAddress());
         }
        

         buildAddress(): FormGroup {
            
             return this.fb.group({//Otro grupo para las dirreciones, chequear beneficios de los FormGroup en el documento Word
                    addressType:'home',
                    street1: '',
                    street2:'',
                    city: '',
                    state: '',
                    zip: ''
             })     

          }
    
       
        setMessage( c:AbstractControl ) :void{ 
            
             this.emailMessage = '';//Tenemos que limpiarlo primero , debido a que el cambio mas reciente en el elemento de entrada, puede hacer todas las reglas de validacion para aprobar, y no quueremos los mensajes sobrantes mostrando.
              
             if((c.touched || c.dirty) && c.errors) {
                  this.emailMessage = Object.keys(c.errors).map(key => //Usando la variable emailMessage podemos mapearla con la funsion y de esa forma podra manejar la visualizacion de multiples mensajes 
                    this.validationMessages[key]).join( '' );
             }
        }
        
        setNotifications(value:string):void{//Este metodo es para configurar la validacion dependiendo de lo que venga en el valor
            
             const phoneControl = this.customerForm.get('phone');//Agarramos los Form del phone  
  
             if (value === 'text'){
                 phoneControl.setValidators(Validators.required)//Si el valor que recibimos es igual a (text) pues seteamos en el phone control que ese campo debe ser requerido con el (setValidators)
             } 
             else{
                 phoneControl.clearValidators()//De lo contrario limpia las validaciones
             }

             phoneControl.updateValueAndValidity();//Esto se usa despues de ajustar o eliminar validaciones
        }
 }
