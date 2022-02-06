class Box {
    constructor(name) {
        this.name = name;
        this.room = [];
    }

    addProduct(name, area) {
        this.room.push(new Product(name, area));
    }
}

class Product {
    constructor(name, area) {
        this.name = name;
        this.area = area;
    }
}


class BoxService {        
    // static url = 'e1d6e8870ff74aa9a79bf5a8de2f8d06'; 
    static url = 'https://ancient-taiga-31359.herokuapp.com/api/houses'; 

    static getAllBoxes() {         
        return $.get(this.url);
    }

    static getBox(id) {         
        return $.get(this.url + `/${id}`);
    }

    static createBox(box) {    
        return $.post(this.url, box);
    }

    static updateBox(box) {     
        return $.ajax({   
            url: this.url + `/${box._id}`,   
            dataType: 'json',   
            data: JSON.stringify(box), 
            contentType: 'application/json',
            type: 'PUT' 
        });
    }

    static deleteBox(id) {
        return $.ajax({
            url: this.url + `/${id}`, 
            type: 'DELETE'  
        });
    }
}

class DOMManager {
    static boxes;

    static getAllBoxes() {
        BoxService.getAllBoxes().then(boxes => this.render(boxes));
    }

    static createBox(name) {
        BoxService.createBox(new Box(name))
        .then(() => {
            return BoxService.getAllBoxes();
        })
        .then((boxes) => this.render(boxes));
    }

    static deleteBox(id) {
        BoxService.deleteBox(id) 
        .then(() => {
            return BoxService.getAllBoxes();
        })
        .then((boxes) => this.render(boxes));
    }

    static addProduct(id) {
        for (let box of this.boxes) {
            if (box._id == id) {
                box.rooms.push(new Product($(`#${box._id}-room-name`).val(), $(`#${box._id}-room-area`).val()));
                BoxService.updateBox(box)
                    .then(() => {
                        return BoxService.getAllBoxes();
                    })
                    .then((boxes) => this.render(boxes));
            }
        }
    }

    static deleteProduct(boxId, roomId) {
        for (let box of this.boxes) {
            if(box._id == boxId) {
                for (let room of box.rooms) {
                    if (room._id == roomId){
                        box.rooms.splice(box.rooms.indexOf(room), 1);
                        BoxService.updateBox(box)
                        .then(() => {
                            return BoxService.getAllBoxes();
                        })
                        .then((boxes) => this.render(boxes));
                    }
                }
            }
        }
    }



    static render(boxes) {
        this.boxes = boxes;
        $('#app').empty();
        for (let box of boxes) {
            $('#app').prepend(
                `<div id="${box._id}" class="card">
                    <div class="card-header">
                        <h2>${box.name}</h2>
                        <button class="btn btn-dark" onclick="DOMManager.deleteBox('${box._id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${box._id}-room-name" class ="form-control" placeHolder="Product">
                                </div>
                                <div class="col-sm">
                                <input type="text" id="${box._id}-room-area" class ="form-control" placeHolder="Price">
                                </div>
                            </div>
                            <button id="${box._id}-new-room" onclick="DOMManager.addProduct('${box._id}')" class="btn  create-button form-control">Add</button>
                        </div>
                    </div>
                </div> <br>`
            );

            for (let room of box.rooms) {
                $(`#${box._id}`).find('.card-body').append(
                    `<p>
                    <span id="name-${room._id}"><strong>Product: </strong> ${room.name}</span>
                    <span id="area-${room._id}"><strong>Price: </strong> ${room.area}</span>
                    <button class="btn btn-dark" onclick="DOMManager.deleteProduct('${box._id}', '${room._id}')">Delete Product</button></p>`
                );
            }
        }
    }
}

$('#create-new-box').click(() => {
    DOMManager.createBox($('#new-box-name').val());
    $('#new-box-name').val('');
})

DOMManager.getAllBoxes();