

// ########### FOR sendParcel.HTML ############



// EVENT ON SENDING DATA
const sendParcel= document.getElementById('sendParcelSubmit')

if(sendParcel){
sendParcel.addEventListener('click', () => {
    const data = {
        senderName: document.getElementById('senderName').value,
        senderPno: document.getElementById('senderPno').value,
        senderEmail: document.getElementById('senderEmail').value,
        senderAddress: document.getElementById('senderAddress').value,
        receiverAddress: document.getElementById('receiverAddress').value,
        receiverPno: document.getElementById('receiverPno').value,
        parcelName: document.getElementById('parcelName').value,
        ParcelWeight: document.getElementById('parcelWeight').value,
        ParcelDate: document.getElementById('date').value
    };

    console.log("Sending data:", data);  

    fetch(`http://localhost:3000/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if(response.ok){
            alert("Parcel Sent Successfully!!")
        }
        return response.json()
    })
    .catch(()=>{
        alert("Parcel Sent Successfully!!")
    })
});

}

// #############################################################




// ########### FOR DELETEPARCEL.HTML ############


//EVENT ON SEARCHING DATA

const findOrder =  document.getElementById('FindOrderDelete');

if(findOrder){
findOrder.addEventListener('click', (e) => {
        e.preventDefault(); 

        const orderId = document.getElementById('orderID').value

        fetch(`http://localhost:3000/order?id=${orderId}`)
        .then( response => {
            if(!response.ok){
                alert(`NO ORDER FOUND WITH ORDER ID: ${orderId}`)
            }
            else{
                return response.json()
            }
        } )

        .then( data => {
           document.querySelector('section').innerHTML+=
           `
           <table class="table table-striped mt-4">
           <thead>
             <tr>
               <th scope="col">Sender Name</th>
               <th scope="col">Sender P.NO</th>
               <th scope="col">Sender Email</th>
               <th scope="col">Delete</th>
             </tr>
           </thead>
           <tbody>
             <tr>
               <td scope="row">${data[0].senderName}</td>           
               <td scope="row">${data[0].senderPhone}</td>           
               <td scope="row">${data[0].senderEmail}</td>           
               <td scope="row" class='deleteIcon'><i class="fa-solid fa-trash-can" style="color: #f41010;} "></i></td>           
             </tr>
           </tbody>
       </table>
           `
           const deleteIcon = document.querySelector('.deleteIcon');
           if(deleteIcon){
            deleteIcon.addEventListener('mouseover',()=>{
                deleteIcon.style.cursor='pointer';
            })

                deleteIcon.addEventListener('click',() =>{
                    fetch(`http://localhost:3000/delete?id=${data[0].id}` , {
                        method:'DELETE'
                    })
                    .then((response)=>response.json())
                    .then((data)=> {
                        alert("Data deleted sucessfully")
                        location.reload();
                    })
                    
                })
           }
        })
    }
);
}

const clrBtn = document.querySelector('.clearBtn');
const findOrderBtn = document.getElementById('FindOrderDelete');
if(clrBtn){
    document.addEventListener('keypress' , (event)=>{
        if(event.keyCode == 13){
            event.preventDefault();
            findOrderBtn.click();
        }
    })
}


// ##########################################################


// ############# ORDER HISTORY ######################

const orderHistory = document.querySelector('.orderHistory')
if(orderHistory){
    fetch('http://localhost:3000/order?id=*')
    .then((response) => response.json())
    .then((data)=>{
        for(let i=data.rows.length-1 ; i>=0 ; i--){
            document.querySelector('tbody').innerHTML+=
            `
            <tr>
            <td>${data.rows[i][0]}</td>
            <td>${data.rows[i][1]}</td>
            <td>${data.rows[i][2]}</td>
            <td>${data.rows[i][6]}</td>
            <td>${data.rows[i][7]}</td>
        </tr>
            `
        }
    })
}


// ####################################################





//###################### FOR PRICETABLE.HTML ######################

var priceTable = document.querySelector('.pricetable');

if(priceTable){
    fetch('http://localhost:3000/order?id=@')
    .then((response)=>response.json())
    .then((data)=>{
       let priceTable = document.querySelector('.pricetable tbody');
        for(let i=0; i<data.rows.length ; i++){
            priceTable.innerHTML+=
            `
            <tr>
            <th scope="row">${i+1}</th>
            <td>${data.rows[i][0]}</td>
            <td>${data.rows[i][1]}</td>
          </tr>
            `
        }
       
    })
}

let increasePrice = document.querySelector('.increasePrice');
if(increasePrice){
   increasePrice.addEventListener('click',()=>{
        let Increament = +prompt("Enter Increament Percentage % (0 to cancel): ");
        if(Increament != 0){

        
        fetch('http://localhost:3000/update',{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify( {
                Increament : Increament,
            })
        })
        .then((response)=>{
            if(response.ok){
                alert("Price Increased Sucessfully!!")
            }
            return response.json()
        })
        .then((data)=>{
            console.log(data)
        })
    }

    })
}
