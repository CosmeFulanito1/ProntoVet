import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Pet } from "../shared/pet/pet.model";
import { PetService } from "../shared/pet/pet.service";
import { TextField } from "tns-core-modules/ui/text-field";
import { ListViewEventData, RadListView } from "nativescript-ui-listview";
import { View } from "tns-core-modules/ui/core/view";

@Component({
    selector: "gr-list",
    templateUrl: "list/list.component.html",
    styleUrls: ["list/list.component.css"],
    providers: [PetService]
})
export class ListComponent implements OnInit {
    petList: Array<Pet> = [];
    pet = "";
    isLoading = false;
    listLoaded = false;
    @ViewChild("petTextField") petTextField: ElementRef;

    constructor(private petService: PetService) { }
    ngOnInit() {
        this.isLoading = true;
        this.petService.load()
            .subscribe(loadedPets => {
                loadedPets.forEach((petObject) => {
                    this.petList.unshift(petObject);
                });
                this.isLoading = false;
                this.listLoaded = true;
            });
    }
    add() {
        if (this.pet.trim() === "") {
            alert("Ingrese una mascota");
            return;
        }

        // Dismiss the keyboard
        let textField = <TextField>this.petTextField.nativeElement;
        textField.dismissSoftInput();

        this.petService.add(this.pet)
            .subscribe(
                petObject => {
                    this.petList.unshift(petObject);
                    this.pet = "";
                },
                () => {
                    alert({
                        message: "Un error ocurrio mientra se agregaba una mascota.",
                        okButtonText: "OK"
                    });
                    this.pet = "";
                }
            )
    }
    onSwipeCellStarted(args: ListViewEventData) {
        var swipeLimits = args.data.swipeLimits;
        var swipeView = args.object;
        var rightItem = swipeView.getViewById<View>("delete-view");
        swipeLimits.right = rightItem.getMeasuredWidth();
        swipeLimits.left = 0;
        swipeLimits.threshold = rightItem.getMeasuredWidth() / 2;
    }

    delete(args: ListViewEventData) {
        let pet = <Pet>args.object.bindingContext;
        this.petService.delete(pet.id)
            .subscribe(() => {
                let index = this.petList.indexOf(pet);
                this.petList.splice(index, 1);
            });
    }
}