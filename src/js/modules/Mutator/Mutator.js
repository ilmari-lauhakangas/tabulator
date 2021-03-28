import Module from '../../core/Module.js';

import defaultMutators from './defaults/mutators.js';

class Mutator extends Module{

	constructor(table){
		super(table);

		this.allowedTypes = ["", "data", "edit", "clipboard"]; //list of muatation types
		this.enabled = true;
	}

	initialize(){
		this.subscribe("cell-value-changing", this.transformCell.bind(this));
	}

	//initialize column mutator
	initializeColumn(column){
		var match = false,
		config = {};

		this.allowedTypes.forEach((type) => {
			var key = "mutator" + (type.charAt(0).toUpperCase() + type.slice(1)),
			mutator;

			if(column.definition[key]){
				mutator = this.lookupMutator(column.definition[key]);

				if(mutator){
					match = true;

					config[key] = {
						mutator:mutator,
						params: column.definition[key + "Params"] || {},
					};
				}
			}
		});

		if(match){
			column.modules.mutate = config;
		}
	}

	lookupMutator(value){
		var mutator = false;

		//set column mutator
		switch(typeof value){
			case "string":
			if(Mutator.mutators[value]){
				mutator = Mutator.mutators[value];
			}else{
				console.warn("Mutator Error - No such mutator found, ignoring: ", value);
			}
			break;

			case "function":
			mutator = value;
			break;
		}

		return mutator;
	}

	//apply mutator to row
	transformRow(data, type, updatedData){
		var key = "mutator" + (type.charAt(0).toUpperCase() + type.slice(1)),
		value;

		if(this.enabled){

			this.table.columnManager.traverse((column) => {
				var mutator, params, component;

				if(column.modules.mutate){
					mutator = column.modules.mutate[key] || column.modules.mutate.mutator || false;

					if(mutator){
						value = column.getFieldValue(typeof updatedData !== "undefined" ? updatedData : data);

						if(type == "data" || typeof value !== "undefined"){
							component = column.getComponent();
							params = typeof mutator.params === "function" ? mutator.params(value, data, type, component) : mutator.params;
							column.setFieldValue(data, mutator.mutator(value, data, type, params, component));
						}
					}
				}
			});
		}

		return data;
	}

	//apply mutator to new cell value
	transformCell(cell, value){
		if(cell.column.modules.mutate){
			var mutator = cell.column.modules.mutate.mutatorEdit || cell.column.modules.mutate.mutator || false,
			tempData = {};

			if(mutator){
				tempData = Object.assign(tempData, cell.row.getData());
				cell.column.setFieldValue(tempData, value);
				return mutator.mutator(value, tempData, "edit", mutator.params, cell.getComponent());
			}
		}

		return value;
	}

	enable(){
		this.enabled = true;
	}

	disable(){
		this.enabled = false;
	}
}

Mutator.moduleName = "mutator";

//load defaults
Mutator.mutators = defaultMutators;

export default Mutator;