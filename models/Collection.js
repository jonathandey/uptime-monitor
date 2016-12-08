"use strict";

class Collection {

	constructor(items)
	{
		items = (items === undefined) ? [] : items;

		this.items = items;

		return this;
	}

	toJson()
	{
		var itemsAttributes = [];

		this.items.forEach(function(item)
		{
			if(item.attributes !== undefined)
			{
				return itemsAttributes.push(item.attributes);
			}

			return itemsAttributes.push(item);
		});

		return JSON.stringify(itemsAttributes);
	}

	getItems()
	{
		return this.items;
	}

	push(item)
	{
		this.items.push(item);

		return this;
	}

}

module.exports = Collection