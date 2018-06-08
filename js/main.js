var app = angular.module('ReceiptBuilder', ['LocalStorageModule']);

app.controller('ReceiptCtrl', ['$scope', 'Receipt', function ($scope, Receipt) {
	$scope.isInPrintView = false;
	$scope.currentDate = Receipt.getDate;
	
	$scope.isHidden = function (item) {
		return $scope.isInPrintView && !item.amount && !item.description;
	};
	
	$scope.removeLine = Receipt.removeLine;
	
	$scope.addLines = Receipt.addLines;
	$scope.getLineItems = Receipt.getLineItems;
	$scope.getTotalAmount = Receipt.getTotalAmount;
	
	$scope.save = Receipt.save;
	$scope.clear = Receipt.clear;
	
	$scope.Receipt = Receipt;
	
}]);

app.service('Receipt', ['localStorageService', function (localStorageService) {
	
	var lineItems = [];
	var date = new Date();
	var savedReceipt = localStorageService.get('receipt');
	
	if (savedReceipt) {
		lineItems = savedReceipt.lineItems;
		date = savedReceipt.date;
	} else {
		addLines(10);
	}
	
	function addLines (amount) {
		for (var i = 0; i < amount; i++) {
			lineItems.push({});
		};
	};
	
	function getLineItems () {
		return lineItems;
	};
	
	this.getLineItems = getLineItems;
	this.addLines = addLines;
	
	this.getTotalAmount = function () {
		var result = 0;
		angular.forEach(lineItems, function (item) {
			if (item.amount && !isNaN(item.amount)) {
				result += parseFloat(item.amount, 10);
			}
		});
		return result;
	};
	
	this.getDate = function () {
		return date;
	};
	
	this.removeLine = function (lineItem) {
		var idx = lineItems.indexOf(lineItem);
		lineItems.splice(idx, 1);
	};
	
	this.save = function () {
		localStorageService.set('receipt', {
			date: date,
			lineItems: this.getLineItems()
		});
	};
	
	this.clear = function () {
		if(confirm('Wipe data?')) {
			lineItems = [];
			addLines(10);
			date = new Date();
			localStorageService.remove('receipt');
		}
	};
	
	function isDirty () {
		var savedReceipt = localStorageService.get('receipt');
		if(!savedReceipt) return true;
		
		var currentItems = getLineItems();
		
		return !angular.equals(currentItems, savedReceipt.lineItems);
	};
	
	this.isDirty = isDirty;
	
	window.onbeforeunload = function (evt) {
		if(!isDirty()) return;
		var message = 'Your receipt is not saved';
		if (typeof evt == 'undefined') {
			evt = window.event;
		}
		if (evt ) {
			evt.returnValue = message;
		}
		
		return message;
	};
	
}]);
