var mainApp = angular.module("mainApp", ["socialLogin", "720kb.socialshare", "blockUI"]);

mainApp.config(function(socialProvider){
	socialProvider.setGoogleKey("662982253205-oakhlretl7rgunb7om01hj3ab8mukndm.apps.googleusercontent.com");
	socialProvider.setFbKey({appId: "342133886290297", apiVersion: "v2.12"});
});

mainApp.config(function(blockUIConfig){
	blockUIConfig.template = '<div class="block-ui-overlay"></div><div class="block-ui-message-container"><div class="block-ui-message" style="padding: 25px 20px 15px 20px;"> <div class="ball-beat"><div></div><div></div><div></div></div> </div></div>';
});

angular.module("mainApp").directive("filesInput", function() {
	return {
	require: "ngModel",
	link: function postLink(scope, elem, attrs, ngModel) {
		elem.on("change", function(e) {
			var files = elem[0].files;
			ngModel.$setViewValue(files);
		})
	}
	}
});

var recipientAddr_counter = 1;
var workersAPI = ['https://project-d3.azurewebsites.net/api/v1', 'https://projectd3.herokuapp.com/api/v1', '/proxy/worker2', '/proxy/worker3', '/api/v1'];
var workers = [];
workers[0] = new NodeRSA('-----BEGIN PUBLIC KEY-----\n'+'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvA0zIfZEBI2GYug72vQM\n'+'Zrg9VlRBesxWR4NEki1fBnl7MSgAYQvHLXW5hKu2xNJ77LmaC57bHgcvPv6JB4l/\n'+'RbNNAcPaSD0NwAKRltSduIOHhy1sceKzR9JNz5iqMOQ4QKy4tHpCh9ikatSHA7EM\n'+'8UeqidMBocwV5S0hQpJKBF6mBHoZkYKzrBAz/fBcqzrd8ZL6+ORjuCw8V4SvHYyt\n'+'XAuOWgk24MpZEX1G4HGXFZNuJCX08pqI+ye5wezMfbXo97Wo6pvN76O76ZDXTJgQ\n'+'pUHg6RXcXp1nylgeB+bS1jxX2JNSI11lJ8w5ondrVpEN+gkbp9dP6lzQeO8UMVvh\n'+'2QIDAQAB\n'+'-----END PUBLIC KEY-----');

workers[1] = new NodeRSA('-----BEGIN PUBLIC KEY-----\n'+'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3KE9Xi13nkuak+m6+gTA\n'+'Sb3T1VyXSH4n+uA0gPa2CpddFeXFRCiAjuPhIibMpW+8o1hhAYlCAX5MW7dAauJu\n'+'7AZ6sAiIebRcme4XjoxPMJCg8d08GbwvDyHzcHk0hcZjP/7i1Ebmc1ldbSUxb8e9\n'+
'6DSaXAukgY0UdE//aMXsw160/YA24AH5sYPCmfqZr8sGffF10F082eWImBZiL0n9\n'+'QxAEzioiNF5nuj2gF9N6ngHhOO8r2EK1t5dKEnI8EGjBBl4ujgmpN6lbLXm+OX8Q\n'+'sMaYmiv5D+d1Qja5sDokm6mHtg/neZohDiFn4xVJp44s3DVWtOdrWxt/sKErToG1\n'+'CQIDAQAB\n'+'-----END PUBLIC KEY-----');

workers[2] = new NodeRSA('-----BEGIN PUBLIC KEY-----\n'+'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhDSbPBS1m05Lh4maFSbn\n'+'2m+txjVG5teJ0Upd7XsfTJvQ7FeQXX9vebDMZ8cTuKQw9Hed7gIe3YYCvAiNg75Z\n'+'/G9ojFn2nHz7S7T2Xln4dtlJz8YfhGX3Ww9sxqogA1VtuEvV8rroxR0DNc7BYEXM\n'+'zqRy/krOVN0yNJf68oA8GKBKkPDZrRTNYoKe7KbipnqWV8h2qlsKvXtS66y7F+/e\n'+'vqJIcnL4Bgdz9Ec5rGWj3CpOyC4hNK6lJ4L1qm33DKixkxIdVc/yEAcswkg5o0H/\n'+'R+EFcZCVCCuxvrzIA+EPAD2bMuUzO4qELtrEHoGUwSiBHkBbLgwvA9TS1JHFi9pl\n'+'PwIDAQAB\n'+'-----END PUBLIC KEY-----');

workers[3] = new NodeRSA('-----BEGIN PUBLIC KEY-----\n'+'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjdPTEAorHoH9O1pd2uEx\n'+'jQfXo43Vwg1kpjtVnN/r/1d2RjLx4qffFHoJ5Dp7pBMuYPW4z6NPftHaPG+xIJo9\n'+'W8yUbDvpvZXnieL0t8cLSMTYxCq4FZaxw9VBPTFJy0pjMZ0kfGOaszN6TUlhttwN\n'+'bTG7P4qN7tzZ4DpirWESeexXAJ5wNaqHC/qIthq1OPr05mg/41lpHmsbMPmkj9Oq\n'+'xHcAv8moisSr1CmXFfLYDtrA1DVNj0+PlRr8AuZ4YnzB6bMeJ9gdaucbwxrYaU0O\n'+'9u9ByMCoNnjcCQtPP4qQBqYCaSCq4+xBgTQK+NIydGVlSbMDJctZLFUPcgvafl0V\n'+'xwIDAQAB\n'+'-----END PUBLIC KEY-----');

workers[4] = new NodeRSA('-----BEGIN PUBLIC KEY-----\n'+'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr7WWroXrBZDzomHiRq5p\n'+'u05sY3P9OW17+TT2ChnLnN6ApDQfqXR0vU4GarcuKbiDyYGwUemuWMyVxt2H1B1P\n'+'0n8H0FYBiTU0dEZEkhde6NjK3WtgeHPads9YUpITwBSFG735CKh4oJj1dILmCE3l\n'+'PxdHiob59Xfb5WEfuskXg3m8/BADdlVJERITvd1j/k/a8pDEGpJuwcriFwHyOJmd\n'+'IC5Ko/yic5DvKm0sAdoMQyo0tlDjvwvG6Fry3qgydh2MdtvgvL1V42g6wYwKHw2X\n'+'r1r0iA1ZLq5d58FUm7G2pV6tzoDSmnN5UhJUNNCvfpfRLFu+aeE5pUluusruCXBS\n'+'8QIDAQAB\n'+'-----END PUBLIC KEY-----');

var splitSize = 5;
var requiredShares = 3;
var ipfs = window.IpfsApi('localhost', '5001');

// jQuery
$(document).ready(function() {

    $(".add-more").click(function(){
	if (recipientAddr_counter < 5){
		var html = $('.copy-fields').children().clone();
		html.attr("id", "removable");
		$(".after-add-more").after(html);
		recipientAddr_counter++;
	}
    });

    $("body").on("click",".remove",function(){ 
	$(this).parents(".control-group").remove();
	recipientAddr_counter--;
    });

    $('.dropify').dropify();

    var clipboard = new ClipboardJS('.btn');

    clipboard.on('success', function(e) {
	alert('Link copied.');
    });

});

function mainController($scope, $window, $http, $timeout, socialLoginService, Socialshare, blockUI) {

    $scope.isWeb3 = false;
    $scope.isLoggedIn = false;
    $scope.isProvidedSignature = false;
    $scope.inView = false;
    $scope.inManage = false;
    $scope.isPrivateUpload = false;
    $scope.accountBalance = 0;

    $scope.selectedSort = "timestamp";

    //file lists
    $scope.files = null;
    $scope.pfiles = null;
    $scope.pubfiles = null;

    //file decrypt
    $scope.fileMeta = null;

    //file upload
    $scope.hiddenChecked = true;
    $scope.descriptionText = "";
    $scope.uploaderEmail = "";

    //contact form
    $scope.contactName = "";
    $scope.contactEmail = "";
    $scope.contactMsg = "";

    //admin functions
    $scope.isAdmin = false;
    $scope.inAdmin = false;
    $scope.reportLogs = null;
    $scope.blacklistLogs = null;
    $scope.blacklistUser = "";

    $scope.signout = function(){
	socialLoginService.logout();
    }
	
    $scope.$on('event:social-sign-in-success', (event, userDetails)=> {
	console.log(userDetails);
	var value = JSON.stringify(userDetails);
	sessionStorage.setItem("user", value);
	$scope.isLoggedIn = true;
	$scope.userName = userDetails.name;
	$scope.userEmail = userDetails.email;
	$scope.userPhoto = userDetails.imageUrl;
	$scope.userToken = userDetails.token;
	$scope.userProvider = userDetails.provider;
	$scope.contactName = userDetails.name;
	$scope.contactEmail = userDetails.email;
	$scope.$apply();
    })

    $scope.$on('event:social-sign-out-success', function(event, userDetails){
	sessionStorage.clear();
	$scope.isLoggedIn = false;
	$scope.userName = null;
	$scope.userEmail = null;
	$scope.userPhoto = null;
	$scope.userToken = null;
	$scope.userProvider = null;
	$scope.pubfiles = null;
	$scope.pfiles = null;
	$scope.contactName = "";
	$scope.contactEmail = "";
	console.log("Signed out successfully.");
	$scope.$apply();
    })

    $scope.getAdminLogs = function() {
	// get Blacklist Logs
	var pastEvent = $scope.IPFSStorage.blacklistLog({}, {fromBlock: 0, toBlock: 'latest'});
	pastEvent.get( function(err, ev_result) {
		if (err) {
			console.log(err);
		} else {
			console.log(ev_result);
			pastEvent.stopWatching(function(err, result){
				if (err){
					console.log('Event watcher failed to stop.');
				}
			});
			var result = [];
			for (var i = 0; i < ev_result.length; i++){
				var obj = {};
				obj["target"] = ev_result[i].args.target.toLocaleString();
				obj["status"] = ev_result[i].args.status.toLocaleString();
				obj["timestamp"] = ev_result[i].args.timestamp.toLocaleString();
				result.push(obj);
			}
			console.log(result);
			result = removeDuplicates(result, 'target');
			console.log(result);
			$scope.blacklistLogs = result.sort(GetSortOrder($scope.selectedSort));
			$scope.$apply();
		}
	});

	// get Report Logs
	var pastEvent2 = $scope.IPFSStorage.reportedLog({}, {fromBlock: 0, toBlock: 'latest'});
	pastEvent2.get( function(err, ev_result) {
		if (err) {
			console.log(err);
		} else {
			console.log(ev_result);
			pastEvent2.stopWatching(function(err, result){
				if (err){
					console.log('Event watcher2 failed to stop.');
				}
			});
			var result = [];
			for (var i = 0; i < ev_result.length; i++){
				var obj = {};
				obj["id"] = toAscii(ev_result[i].args.id.toLocaleString());
				obj["sender"] = ev_result[i].args.sender.toLocaleString();
				obj["timestamp"] = ev_result[i].args.timestamp.toLocaleString();
				obj["total"] = ev_result[i].args.total.toLocaleString();
				result.push(obj);
			}
			console.log(result);
			$scope.reportLogs = result.sort(GetSortOrder($scope.selectedSort));
			$scope.$apply();
		}
	});
    }


    $scope.updateAdminView = function(selectedSort) {
	console.log(selectedSort);
	$scope.reportLogs = $scope.reportLogs.sort(GetSortOrder(selectedSort));
    }

    $scope.setBlacklist = function() {
	if (!isValidAddress($scope.blacklistUser)){
		bootpopup.alert("Please enter a valid Ethereum address!", "Invalid address");
		return;
	}
	bootpopup.confirm("Are you sure to blacklist " + $scope.blacklistUser + "?", "Confirm Blacklist", function(ans) { 
		if (ans){
			var target = $scope.blacklistUser;
			alertHandler("Please confirm your transaction in MetaMask..");
			$scope.IPFSStorage.setBlacklist(target, true, {from: $scope.userName, gas: 500000 }, function(err, tx_hash){
				if (err){
					alertHandler('Transaction failed.');
				} else {
					$scope.blacklistUser = "";
					var url = "https://rinkeby.etherscan.io/tx/" + tx_hash;
					bootpopup({
						title: "Blacklist User - Pending Confirmation",
						size: "large",
					   	content: [
							'<div class="row" style="margin-top: 20px;"><div class="col-md-2 col-md-offset-1">Transaction Hash: </div><div class="col-md-9"><p><b>' + tx_hash + '</b></p></div></div>',
							'<div class="row"><div style="margin-top: 25px;" class="col-sm-12"><div class="ball-grid-pulse" style="position: relative; margin-left: auto;margin-right: auto;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>',
							'<div class="row" style="margin-top: 30px;"><div class="col-md-12 text-center">Please wait for around 20~50 seconds for the transaction to be confirmed. You may view your transaction status at:</div></div>',
							'<div class="row" style="margin-top: 5px; margin-bottom: 20px;"><div class="col-md-12 text-center"><p><a class="link" target="_blank" href="' + url +'">'+ url +'</a></p></div></div>',
						],
						complete: function() { $scope.$apply(); }
					});
				}
			});
		} 				
	});
    }

    $scope.setUnblock = function(target) {
	if (!isValidAddress(target)){
		bootpopup.alert("Target is not a valid Ethereum address!", "Invalid address - " + target);
		return;
	}
	bootpopup.confirm("Are you sure to unblock " + target + "?", "Confirm Unblock", function(ans) { 
		if (ans){
			alertHandler("Please confirm your transaction in MetaMask..");
			$scope.IPFSStorage.setBlacklist(target, false, {from: $scope.userName, gas: 500000 }, function(err, tx_hash){
				if (err){
					alertHandler('Transaction failed.');
				} else {
					var url = "https://rinkeby.etherscan.io/tx/" + tx_hash;
					bootpopup({
						title: "Unblock User - Pending Confirmation",
						size: "large",
					   	content: [
							'<div class="row" style="margin-top: 20px;"><div class="col-md-2 col-md-offset-1">Transaction Hash: </div><div class="col-md-9"><p><b>' + tx_hash + '</b></p></div></div>',
							'<div class="row"><div style="margin-top: 25px;" class="col-sm-12"><div class="ball-grid-pulse" style="position: relative; margin-left: auto;margin-right: auto;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>',
							'<div class="row" style="margin-top: 30px;"><div class="col-md-12 text-center">Please wait for around 20~50 seconds for the transaction to be confirmed. You may view your transaction status at:</div></div>',
							'<div class="row" style="margin-top: 5px; margin-bottom: 20px;"><div class="col-md-12 text-center"><p><a class="link" target="_blank" href="' + url +'">'+ url +'</a></p></div></div>',
						]
					});
				}
			});
		} 				
	});
    }

    $scope.showSelfInfo = function(x) {
	bootpopup({
		title: x.filename,
	    	content: [
		'<div class="row" style="margin-top: 5px;"><div class="col-md-3">File ID: </div><div class="col-md-5">' + toAscii(x.id) + '</div></div>',
		'<div class="row" style="margin-top: 5px;"><div class="col-md-3">File Type: </div><div class="col-md-5">' + x.mimetype + '</div></div>',
		'<div class="row" style="margin-top: 5px;"><div class="col-md-3">File Size: </div><div class="col-md-5">' + $scope.humanFileSize(x.size) + '</div></div>',
		'<div class="row" style="margin-top: 5px;"><div class="col-md-3">Description: </div><div class="col-md-5">' + x.description + '</div></div>'
		]
	});
    }

    $scope.showInfo = function(x) {
	bootpopup({
		title: x.filename,
	    	content: [
		'<div class="row" style="margin-top: 5px;"><div class="col-md-3">File ID: </div><div class="col-md-5">' + toAscii(x.id) + '</div></div>',
		'<div class="row" style="margin-top: 5px;"><div class="col-md-3">File Type: </div><div class="col-md-5">' + x.mimetype + '</div></div>',
		'<div class="row" style="margin-top: 5px;"><div class="col-md-3">File Size: </div><div class="col-md-5">' + $scope.humanFileSize(x.size) + '</div></div>',
		'<div class="row" style="margin-top: 5px;"><div class="col-md-3">Uploaded by: </div><div class="col-md-5">' + x.owner + '</div></div>',
		'<div class="row" style="margin-top: 5px;"><div class="col-md-3">Uploader Address: </div><div class="col-md-5">' +  x.address + '</div></div>',
		'<div class="row" style="margin-top: 5px;"><div class="col-md-3">Description: </div><div class="col-md-5">' + x.description + '</div></div>',
		]
	});
    }

    $scope.shareFile = function(x) {
	var shareURL = "https://project-d3.xyz/download/" + toAscii(x.id);
	bootpopup({
		title: "Share " + x.filename + " with your friends!",
		size: "large",
	    	content: [
		'<div class="row" style="margin-top: 10px;"><div class="col-md-4 col-md-offset-1"><strong>Sharing link: </strong></div></div>',
		'<div class="row" style="margin-top: 10px;"><div class="col-md-10 col-md-offset-1"><div class="input-group" style="width: 100%;"><input type="text" class="form-control" id="copylink" value="' + shareURL + '"><div class="input-group-btn"><button class="btn btn-default" data-clipboard-target="#copylink"><i class="glyphicon glyphicon-copy"></i></button></div></div></div></div>',
		'<div class="row" style="margin-top: 20px; margin-bottom: 20px;"><div class="col-md-12 text-center"><a onclick="angular.element(this).scope().fbShare(\'' + x.filename + '\',\'' + toAscii(x.id) + '\');" class="btn-social btn-facebook"><i class="fa fa-facebook"></i></a> <a onclick="angular.element(this).scope().googleShare(\'' + x.filename + '\',\'' + toAscii(x.id) + '\');" class="btn-social btn-google-plus"><i class="fa fa-google-plus"></i></a> <a onclick="angular.element(this).scope().twitterShare(\'' + x.filename + '\',\'' + toAscii(x.id) + '\');" class="btn-social btn-twitter"><i class="fa fa-twitter"></i></a> <a onclick="angular.element(this).scope().redditShare(\'' + x.filename + '\',\'' + toAscii(x.id) + '\');" class="btn-social btn-reddit"><i class="fa fa-reddit"></i></a> <a onclick="angular.element(this).scope().telegramShare(\'' + x.filename + '\',\'' + toAscii(x.id) + '\');" class="btn-social btn-telegram"><i class="fa fa-telegram"></i></a> <a onclick="angular.element(this).scope().emailShare(\'' + x.filename + '\',\'' + toAscii(x.id) + '\');" class="btn-social btn-email"><i class="fa fa-envelope"></i></a></div></div>',
		]
	});
    }

    $scope.sharePrivateFile = function(x) {
	var shareURL = "https://project-d3.xyz/download";
	bootpopup({
		title: "Share " + x.filename + " with your friends!",
		size: "large",
	    	content: [
		'<div class="row" style="margin-top: 10px;"><div class="col-md-4 col-md-offset-1"><strong>Download link for target recipients: </strong></div></div>',
		'<div class="row" style="margin-top: 10px;"><div class="col-md-10 col-md-offset-1"><div class="input-group" style="width: 100%;"><input type="text" class="form-control" id="copylink" value="' + shareURL + '"><div class="input-group-btn"><button class="btn btn-default" data-clipboard-target="#copylink"><i class="glyphicon glyphicon-copy"></i></button></div></div></div></div>',
		'<div class="row" style="margin-top: 25px;"><div class="col-md-2 col-md-offset-1">Share this file ID: </div><div class="col-md-9"><strong>' + toAscii(x.id) + '</strong></div></div>',
		'<div class="row" style="margin-top: 30px; margin-bottom: 20px;"><div class="col-md-12 text-center"><a onclick="angular.element(this).scope().fbPrivateShare(\'' + x.filename + '\',\'' + toAscii(x.id) + '\');" class="btn-social btn-facebook"><i class="fa fa-facebook"></i></a> <a onclick="angular.element(this).scope().googlePrivateShare(\'' + x.filename + '\',\'' + toAscii(x.id) + '\');" class="btn-social btn-google-plus"><i class="fa fa-google-plus"></i></a> <a onclick="angular.element(this).scope().twitterPrivateShare(\'' + x.filename + '\',\'' + toAscii(x.id) + '\');" class="btn-social btn-twitter"><i class="fa fa-twitter"></i></a> <a onclick="angular.element(this).scope().redditPrivateShare(\'' + x.filename + '\',\'' + toAscii(x.id) + '\');" class="btn-social btn-reddit"><i class="fa fa-reddit"></i></a> <a onclick="angular.element(this).scope().telegramPrivateShare(\'' + x.filename + '\',\'' + toAscii(x.id) + '\');" class="btn-social btn-telegram"><i class="fa fa-telegram"></i></a> <a onclick="angular.element(this).scope().emailPrivateShare(\'' + x.filename + '\',\'' + toAscii(x.id) + '\');" class="btn-social btn-email"><i class="fa fa-envelope"></i></a></div></div>',
		]
	});
    }

    $scope.fbShare = function(name, id) {
	var shareURL = "https://project-d3.xyz/download/" + id;
	Socialshare.share({
	      'provider': 'facebook',
	      'attrs': {
		'socialshareUrl': shareURL,
		'socialshareQuote': "Download " + name + " via D3"
	      }
	    });
	$scope.$apply();
    }

    $scope.googleShare = function(name, id) {
	var shareURL = "https://project-d3.xyz/download/" + id;
	Socialshare.share({
	      'provider': 'google',
	      'attrs': {
		'socialshareUrl': shareURL
	      }
	    });
	$scope.$apply();
    }

    $scope.twitterShare = function(name, id) {
	var shareURL = "https://project-d3.xyz/download/" + id;
	Socialshare.share({
	      'provider': 'twitter',
	      'attrs': {
		'socialshareUrl': shareURL,
		'socialshareText': "Download " + name + " via D3"
	      }
	    });
	$scope.$apply();
    }

    $scope.redditShare = function(name, id) {
	var shareURL = "https://project-d3.xyz/download/" + id;
	Socialshare.share({
	      'provider': 'reddit',
	      'attrs': {
		'socialshareUrl': shareURL,
		'socialshareText': "Download " + name + " via D3"
	      }
	    });
	$scope.$apply();
    }

    $scope.telegramShare = function(name, id) {
	var shareURL = "https://project-d3.xyz/download/" + id;
	Socialshare.share({
	      'provider': 'telegram',
	      'attrs': {
		'socialshareUrl': shareURL,
		'socialshareText': "Download " + name + " via D3"
	      }
	    });
	$scope.$apply();
    }

    $scope.emailShare = function(name, id) {
	var shareURL = "https://project-d3.xyz/download/" + id;
	Socialshare.share({
	      'provider': 'email',
	      'attrs': {
		'socialshareBody': shareURL,
		'socialshareSubject': "Download " + name + " via D3"
	      }
	    });
	$scope.$apply();
    }

    $scope.fbPrivateShare = function(name, id) {
	var shareURL = "https://project-d3.xyz/download";
	Socialshare.share({
	      'provider': 'facebook',
	      'attrs': {
		'socialshareUrl': shareURL,
		'socialshareQuote': "Download " + name + " via D3 - fileID: " + id
	      }
	    });
	$scope.$apply();
    }

    $scope.googlePrivateShare = function(name, id) {
	var shareURL = "https://project-d3.xyz/download";
	Socialshare.share({
	      'provider': 'google',
	      'attrs': {
		'socialshareUrl': shareURL
	      }
	    });
	$scope.$apply();
    }

    $scope.twitterPrivateShare = function(name, id) {
	var shareURL = "https://project-d3.xyz/download";
	Socialshare.share({
	      'provider': 'twitter',
	      'attrs': {
		'socialshareUrl': shareURL,
		'socialshareText': "Download " + name + " via D3 - fileID: " + id
	      }
	    });
	$scope.$apply();
    }

    $scope.redditPrivateShare = function(name, id) {
	var shareURL = "https://project-d3.xyz/download";
	Socialshare.share({
	      'provider': 'reddit',
	      'attrs': {
		'socialshareUrl': shareURL,
		'socialshareText': "Download " + name + " via D3 - fileID: " + id
	      }
	    });
	$scope.$apply();
    }

    $scope.telegramPrivateShare = function(name, id) {
	var shareURL = "https://project-d3.xyz/download";
	Socialshare.share({
	      'provider': 'telegram',
	      'attrs': {
		'socialshareUrl': shareURL,
		'socialshareText': "Download " + name + " via D3 - fileID: " + id
	      }
	    });
	$scope.$apply();
    }

    $scope.emailPrivateShare = function(name, id) {
	var shareURL = "https://project-d3.xyz/download";
	Socialshare.share({
	      'provider': 'email',
	      'attrs': {
		'socialshareBody': shareURL + "\nFileID: " + id,
		'socialshareSubject': "Download " + name + " via D3"
	      }
	    });
	$scope.$apply();
    }

    $scope.updateView = function(selectedSort) {
	console.log(selectedSort);
	$scope.files = $scope.files.sort(GetSortOrder(selectedSort));
    }

    $scope.getFileList = function() {
	$http.get("/getFileList")
	.success(function(data) {
	    console.log(data);
	    $scope.files = data.sort(GetSortOrder($scope.selectedSort));
	})
	.error(function(data) {
	    console.log('Error: ' + data);
	    bootpopup.alert("Error: " + data, "ERROR");
	});
    }

    $scope.getFileListAPI = function() {
		$scope.IPFSStorage.getFileCount({from: $scope.userName, gas: 500000 }, function(err, data){
			if (err){
				console.log('getFileCount failed.');
				bootpopup.alert("Error: getFileCount failed.", "ERROR");
			} else {
				var total = data.toLocaleString();
				console.log(total);
				if (total == 0){
					return;
				}
				var IDList = [];
				var numCompletedCalls = 0;

				for (var index = 0; index < total; index++) {
					$scope.IPFSStorage.getFileID(index, {from: $scope.userName, gas: 500000 }, function(err, data){
						console.log(data);
						if (isValidByte32(data)){
							IDList.push(data.toLocaleString());
						}
						numCompletedCalls++;

						if (numCompletedCalls == total){
							console.log(IDList);
							var resultList = [];
							//var numCompletedFileCalls = 0;

							IDList.forEach(function(fileID, index) {
								var finished = false;
								var shares = [];
								// async request to ask workers
								workersAPI.forEach( function(api, index) {
									$http({
										url: api,
										method: 'POST',
										crossDomain: true,
										data: { "id": fileID }
									})
									.success(function(data) {
										if (!finished){
											shares.push(data.share);
										}
										if (!finished && shares.length == requiredShares){
											finished = true;
											console.log(shares);
											// combine to retrieve the original meta hash
											var meta_hash = secrets.hex2str(secrets.combine(shares));
											console.log(meta_hash);
											// get back Meta info from IPFS
											$http({
												url: "/api/ipfs/cat/" + meta_hash,
												method: 'GET',
											})
											.success(function(data) {
												console.log(data);
												var tempMeta = data;
												$scope.IPFSStorage.getFile(fileID, {from: $scope.userName, gas: 500000 }, function(err, data){
													if (err){
														console.log(err);
													} else {
														tempMeta["id"] = data[0];
														tempMeta["address"] = data[1];
														tempMeta["modified"] = data[2].toLocaleString();
														tempMeta["reported"] = data[3].toLocaleString();
														resultList.push(tempMeta);
														console.log(resultList);
														$scope.files = resultList.sort(GetSortOrder($scope.selectedSort));
														$scope.$apply();
													}
												});
											})
											.error(function(data) {
												console.log('Error: ' + data);
											});
										}
									})
									.error(function(data) {
										console.log('Error: ' + data);
									});
								}); // END ASYNC
							}); // END forEach
						}
					});
				}
			}
		});
		// END Web3
    }

    $scope.reportFile = function(x) {
	bootpopup.confirm("Do you wish to report "+ x.filename +" for inappropriate content?", "Confirm report file", function(ans) { 
		if (ans == true){
			x.disabled = true;
			alertHandler("Please confirm your transaction in MetaMask..");
			$scope.IPFSStorage.setReported( x.id, {from: $scope.userName, gas: 500000 }, function(err, tx_hash){
				if (err){
					alertHandler('Transaction failed.');
					x.disabled = false;
				} else {
					var url = "https://rinkeby.etherscan.io/tx/" + tx_hash;
					bootpopup({
						title: "Report File - Pending Confirmation",
						size: "large",
					   	content: [
							'<div class="row" style="margin-top: 20px;"><div class="col-md-2 col-md-offset-1">Transaction Hash: </div><div class="col-md-9"><p><b>' + tx_hash + '</b></p></div></div>',
							'<div class="row"><div style="margin-top: 25px;" class="col-sm-12"><div class="ball-grid-pulse" style="position: relative; margin-left: auto;margin-right: auto;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>',
							'<div class="row" style="margin-top: 30px;"><div class="col-md-12 text-center">Please wait for around 20~50 seconds for the transaction to be confirmed. You may view your transaction status at:</div></div>',
							'<div class="row" style="margin-top: 5px; margin-bottom: 20px;"><div class="col-md-12 text-center"><p><a class="link" target="_blank" href="' + url +'">'+ url +'</a></p></div></div>',
						],
						complete: function() { $scope.$apply(); }
					});
				}
			});
		}
	});
    };

    $scope.getOwnFileListAPI = function() {
	// sign to verify your address
	if (!$scope.isProvidedSignature){
		alertHandler("Please sign to verify your account address in MetaMask..");
		web3.eth.sign($scope.userName, web3.sha3("ProjectD3"), function(err, result){
			if (err){
				console.log("ERROR: " + err);
			} else {
				console.log(result);
				var value = JSON.stringify({ signature: result });					
				sessionStorage.setItem("signature", value);
				$scope.isProvidedSignature = true;
				$scope.userSignature = result;
				$window.location.href = '/manage';
			}
		});
	} else {
		$scope.IPFSStorage.getFileCount({from: $scope.userName, gas: 500000 }, function(err, data){
			if (err){
				console.log('getFileCount failed.');
				bootpopup.alert("Error: getFileCount failed.", "ERROR");
			} else {
				var total = data.toLocaleString();
				console.log(total);
				if (total == 0){
					return;
				}
				var IDList = [];
				var numCompletedCalls = 0;

				for (var index = 0; index < total; index++) {
					$scope.IPFSStorage.getFileID(index, {from: $scope.userName, gas: 500000 }, function(err, data){
						console.log(data);
						if (isValidByte32(data)){
							IDList.push(data.toLocaleString());
						}
						numCompletedCalls++;

						if (numCompletedCalls == total){
							console.log(IDList);
							var publicResultList = [];
							var privateResultList = [];
							//var numCompletedFileCalls = 0;

							IDList.forEach(function(fileID, index) {

								$scope.IPFSStorage.getOwnFile(fileID, {from: $scope.userName, gas: 500000 }, function(err, file_data){
									if (err){
										console.log(err);
									} else {
										console.log(file_data);
										// check if valid
										if (isValidByte32(file_data[0])){
											var finished = false;
											var shares = [];
											// async request to ask workers
											workersAPI.forEach( function(api, index) {
												$http({
													url: api,
													method: 'POST',
													crossDomain: true,
													data: { "id": fileID, "signature": $scope.userSignature }
												})
												.success(function(data) {
													if (!finished){
														shares.push(data.share);
													}
													if (!finished && shares.length == requiredShares){
														finished = true;
														console.log(shares);
														// combine to retrieve the original meta hash
														var meta_hash = secrets.hex2str(secrets.combine(shares));
														console.log(meta_hash);
														// get back Meta info from IPFS
														$http({
															url: "/api/ipfs/cat/" + meta_hash,
															method: 'GET',
														})
														.success(function(data) {
															console.log(data);
															var tempMeta = data;
															tempMeta["meta"] = meta_hash;
															tempMeta["id"] = file_data[0];
															tempMeta["visible"] = file_data[1];
															tempMeta["modified"] = file_data[2].toLocaleString();
															tempMeta["reported"] = file_data[3].toLocaleString();
															if (tempMeta.hasOwnProperty("passphrase")){
																privateResultList.push(tempMeta);
															} else {
																publicResultList.push(tempMeta);
															}
															console.log(publicResultList);
															console.log(privateResultList);
															$scope.pubfiles = publicResultList.sort(GetSortOrder("modified"));
															$scope.pfiles = privateResultList.sort(GetSortOrder("modified"));
															$scope.$apply();
														})
														.error(function(data) {
															console.log('Error: ' + data);
														});
													}
												})
												.error(function(data) {
													console.log('Error: ' + data);
												});
											}); // END ASYNC
										}
									}
								});
							}); // END forEach
						}
					});
				}
			}
		});
		// END Web3
	}
    }

    $scope.getOwnFileList = function() {
	$http({
		url: "/getOwnFileList",
		method: 'POST',
		data: { "token": $scope.userToken, "tokenProvider": $scope.userProvider}
	})
	.success(function(data) {
		console.log(data);
		$scope.pubfiles = data[0].sort(GetSortOrder($scope.selectedSort));
		$scope.pfiles = data[1].sort(GetSortOrder($scope.selectedSort));
	})
	.error(function(data) {
		console.log('Error: ' + data);
		bootpopup.alert("Error: " + data, "ERROR");
	});
    }

    $scope.getFileMeta = function() {
	var fileID = $scope.decryptIndex;
	
	if (fileID.length != 32){
		bootpopup.alert("Please enter a valid file index!", "Invalid index");
		return;
	}

	if ($scope.isWeb3){
		// sign to verify your address
		if (!$scope.isProvidedSignature){
			alertHandler("Please sign to verify your account address in MetaMask..");
			web3.eth.sign($scope.userName, web3.sha3("ProjectD3"), function(err, result){
				if (err){
					console.log("ERROR: " + err);
				} else {
					console.log(result);
					var value = JSON.stringify({ signature: result });					
					sessionStorage.setItem("signature", value);
					$scope.isProvidedSignature = true;
					$scope.userSignature = result;

					var finished = false;
					var shares = [];
					var numOfError = 0;
					// async request to ask workers
					workersAPI.forEach( function(api, index) {
						$http({
							url: api,
							method: 'POST',
							crossDomain: true,
							data: { "id": fileID, "signature": $scope.userSignature }
						})
						.success(function(data) {
							if (!finished){
								shares.push(data.share);
							}
							if (shares.length == requiredShares){
								finished = true;
								console.log(shares);
								// combine to retrieve the original meta hash
								var meta_hash = secrets.hex2str(secrets.combine(shares));
								console.log(meta_hash);
								// get back Meta info from IPFS
								$http({
									url: "/api/ipfs/cat/" + meta_hash,
									method: 'GET',
								})
								.success(function(data) {
									console.log(data);
									$scope.fileMeta = data;
								})
								.error(function(data) {
									bootpopup.alert("File not found.", "ERROR");
									console.log('Error: ' + data);
								});
							}
						})
						.error(function(data) {
							console.log('Error: ' + data);
							numOfError++;
							if ( numOfError == workersAPI.length){
								bootpopup.alert("File not found.", "ERROR");
							}
						});
					}); // END
				}
			});
		} else {
			var finished = false;
			var shares = [];
			var numOfError = 0;
			// async request to ask workers
			workersAPI.forEach( function(api, index) {
				$http({
					url: api,
					method: 'POST',
					crossDomain: true,
					data: { "id": fileID, "signature": $scope.userSignature }
				})
				.success(function(data) {
					if (!finished){
						shares.push(data.share);
					}
					if (shares.length == requiredShares){
						finished = true;
						console.log(shares);
						// combine to retrieve the original meta hash
						var meta_hash = secrets.hex2str(secrets.combine(shares));
						console.log(meta_hash);
						// get back Meta info from IPFS
						$http({
							url: "/api/ipfs/cat/" + meta_hash,
							method: 'GET',
						})
						.success(function(data) {
							console.log(data);
							$scope.fileMeta = data;
						})
						.error(function(data) {
							bootpopup.alert("File not found.", "ERROR");
							console.log('Error: ' + data);
						});
					}
				})
				.error(function(data) {
					console.log('Error: ' + data);
					numOfError++;
					if ( numOfError == workersAPI.length){
						bootpopup.alert("File not found.", "ERROR");
					}
				});
			}); // END
		}
	// verify with OAuth token
	} else {
		$http({
			url: "/getFileMeta",
			method: 'POST',
			data: { "id": fileID, "token": $scope.userToken, "tokenProvider": $scope.userProvider}
		})
		.success(function(data) {
			console.log(data);
			$scope.fileMeta = data;
		})
		.error(function(data) {
			bootpopup.alert("File not found.", "ERROR");
			console.log('Error: ' + data);
		});
	}
    }

    $scope.downloadFile = function(meta) {

	console.log('Trying to use local IPFS node...');
	blockUI.start();
	var get_success = 0;
	console.log(meta.hash);
	ipfs.files.get(meta.hash, function (err, files) {
		try {
			if(err) {
				console.log("Failed to connect to local IPFS node: " + err);
				throw err;
		      	}
		  	files.forEach((file) => {
				get_success++;  // cancel blockUI
				console.log(file);
				var data = file.content.buffer;
				console.log(data);
				if (meta.hasOwnProperty("passphrase")){
					decryptPayload(data, getPassphrase(meta.passphrase)).then(process).catch(alertHandler);
				} else {
					saveAsFile(meta.filename, data, meta.type);
				}
			});

		} catch (e) {
			get_success++; // cancel blockUI
			console.log('Using gateway.. local IPFS node failed: ' + err);
			delete $http.defaults.headers.common['X-Requested-With'];
			if (meta.hasOwnProperty("passphrase")){
				$http({
					url: "/direct/" + meta.hash,
					method: 'GET',
					responseType: "arraybuffer"
				})
				.success(function(data) {
					console.log(data);
					decryptPayload(data, getPassphrase(meta.passphrase)).then(process).catch(alertHandler);
				})
				.error(function(data) {
					bootpopup.alert("File not found.", "ERROR");
				    console.log('Error: ' + data);
				});

			} else {
				var url = "https://project-d3.xyz/download/" + toAscii(meta.id);
				window.location.href = url;
			}
		}

	});
	$timeout(function() {
		if (get_success == 1){
			blockUI.stop();
			get_success++;
		}
	}, 500);

	$timeout(function() {
		if (get_success == 1){
			blockUI.stop();
			get_success++;
		}
	}, 1000);

	$timeout(function() { 
		if (get_success == 1){
			blockUI.stop();
			get_success++;
		}
	}, 3000); 

	$timeout(function() { 
		if (get_success == 1){
			blockUI.stop();
			get_success++;
		}
	}, 5000); 

	$timeout(function() { 
		if (get_success == 1){
			blockUI.stop();
			get_success++;
		}
	}, 10000);

	$timeout(function() { 
		if (get_success == 1){
			blockUI.stop();
			get_success++;
		}
	}, 15000);

	$timeout(function() { 
		if (get_success == 1){
			blockUI.stop();
			get_success++;
		}
	}, 20000);

	$timeout(function() { 
		if (get_success == 1){
			blockUI.stop();
			get_success++;
		}
	}, 30000);

	$timeout(function() { 
		if (get_success == 1){
			blockUI.stop();
			get_success++;
		}
	}, 40000);

	$timeout(function() { 
		if (get_success == 1){
			blockUI.stop();
			get_success++;
		}
	}, 50000);

	$timeout(function() {
		blockUI.stop();
		if (get_success < 1){
			bootpopup.alert("File not found.", "ERROR");
	    		console.log('Error: IPFS timed out.');
		}
	}, 60000);

	function decryptPayload(payload, passphrase){
		const view = new Uint8Array(payload);
		const salt = view.slice(0, 16);
		const iv = view.slice(16, 16 + 12);

		const ciphertext = new Uint8Array(payload, 16 + 12);

		return deriveKey(passphrase, salt).then(key => {
		    const algorithm = { name: 'AES-GCM', iv: iv, tagLength: 128 };

		    return window.crypto.subtle.decrypt(
		        algorithm, key, ciphertext
		    ).catch(() => Promise.reject('File decryption failed. Invalid passphrase!'));
		});
	}

	function process(payload){
		const szView = new Uint32Array(payload, 0, 1);
		const metadataSz = szView[0];

		const mdView = new Uint16Array(payload, 4, (metadataSz / 2));
		const fdView = new Uint8Array(payload, 4 + metadataSz);

		const metadata = JSON.parse(String.fromCharCode.apply(null, mdView));

		let fdIndex = 0;

		metadata.forEach(file => {
			const fileBuf = new ArrayBuffer(file.size);
			const fileView = new Uint8Array(fileBuf);

			for (let i = 0, len = file.size; i < len; i++){
				fileView[i] = fdView[fdIndex++];
			}
			
			saveAsFile(meta.filename, fileBuf, meta.type);
		});
	}

	function saveAsFile(fileName, fileBuf, fileType){
		var binary = '';
        var bytes = new Uint8Array( fileBuf );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
	    }
	    var base64 = "data:" + fileType + ";base64," + window.btoa( binary );
	    var uri = encodeURI(base64);

		//const blob = new Blob([fileBuf], { type: fileType });
		//const url = window.URL.createObjectURL(blob);
		const anchor = document.getElementById('download');

		anchor.href = uri;
		anchor.download = fileName;
		anchor.click();

		window.URL.revokeObjectURL(uri);
	}
    }

    $scope.validateUpload = function() {
	 
	var fileInput = document.querySelector("#uploadFile");
	var files = Array.from(fileInput.files);

	if (!files[0]){
		bootpopup.alert("Please choose a file to upload.", "File not found");
		return;
	}

	if (files[0].size > 500*1024*1024){
		bootpopup.alert("File size exceeds limit! The current maximum file upload size is 500 MB.", "Invalid file");
		return;
	}
	
	if ($scope.uploaderEmail != "" && !isValidEmail($scope.uploaderEmail)){
		bootpopup.alert("Oops! Your email address is invalid!", "Invalid email");
		return;
	}

	if ($scope.isPrivateUpload){
		
		var addressList = [];
		var tempList =  $("input[name='recipientAddr[]']").map(function(){return $(this).val();}).get();
		console.log(tempList);
		for (var i = 0; i < tempList.length; i++) {
			var item = tempList[i];
			if (item != ""){
				if (!isValidAddress(item) && !isValidEmail(item)){
					bootpopup.alert("Please enter a valid Ethereum/email address!", "Invalid recipient - " + item);
					return;
				}
				if (!addressList.includes(item)){
		    			addressList.push(item);
				}
			}
		}

		console.log(addressList.length);
		if (addressList.length <= 0){
			if (!$scope.isLoggedIn){
				bootpopup.alert("Please specify at least one recipient!", "Invalid recipient(s)");
				return;
			} else {
				bootpopup.confirm("You have not specified any recipients - only you will be able to access this file (You can add recipients anytime later!). Continue to upload?", "Confirm Private Upload", function(ans) { 
					if (ans){
						if ($scope.isWeb3){
							console.log('Doing Private API Upload...');
							$scope.uploadEncryptAPI(files, addressList);
						} else {
							console.log('Doing Private Upload...');
							$scope.uploadEncrypt(files, addressList);
						}
					} 				
				});
			}
		} else {
			if (!$scope.isLoggedIn){
				bootpopup.confirm("You are not logged in - you will NOT be able to manage and delete this file after upload. Continue?", "Confirm Anonymous Upload", function(ans) { 
					if (ans){
						if ($scope.isWeb3){
							console.log('Doing Private API Upload...');
							$scope.uploadEncryptAPI(files, addressList);
						} else {
							console.log('Doing Private Upload...');
							$scope.uploadEncrypt(files, addressList);
						}
					}
				});
			} else {
				if ($scope.isWeb3){
					console.log('Doing Private API Upload...');
					$scope.uploadEncryptAPI(files, addressList);
				} else {
					console.log('Doing Private Upload...');
					$scope.uploadEncrypt(files, addressList);
				}
			}
		}
	} else {
		if (!$scope.isLoggedIn){
			bootpopup.confirm("You are not logged in - you will NOT be able to manage and delete this file after upload. Continue?", "Confirm Anonymous Upload", function(ans) { 
				if (ans){
					if ($scope.isWeb3){
						console.log('Doing Public API Upload...');
						$scope.uploadPublicAPI(files);
					} else {
						console.log('Doing Public Upload...');
						$scope.uploadPublic(files);
					}
				}
			});
		} else {
			if ($scope.isWeb3){
				console.log('Doing Public API Upload...');
				$scope.uploadPublicAPI(files);
			} else {
				console.log('Doing Public Upload...');
				$scope.uploadPublic(files);
			}
		}
	}
    };

    //////////////// Web3 APIs
    $scope.uploadPublicAPI = function(files) {

	var original_name = files[0].name;
	var original_size = files[0].size;
	var original_type = files[0].type;
	var desText = trim($scope.descriptionText);
	var id = secrets.random(128);
	console.log('This file id: ' + id);

	var payload = new FormData();
	payload.append("id", id);
	payload.append("username", $scope.userName);
	payload.append("description", desText);
	payload.append("data", files[0]);

	$http({
		url: "/api/upload/public",
		method: 'POST',
		data: payload,
		headers: { 'Content-Type': undefined },
        	//prevents serializing payload
        	transformRequest: angular.identity
	})
	.success(function(data) {
		// returned IPFS hash & meta hash
		console.log(data);
		var original_file = data.file_hash;

		// randomly choose worker
		var chosen_workers = getRandom(workers, splitSize);
		for (var i =0; i <splitSize; i++){
			console.log(workers.indexOf(chosen_workers[i]));
		}
		console.log(chosen_workers);

		// split and encrypt
		var metaHex = secrets.str2hex(data.meta_hash);
		var shares = secrets.share(metaHex, splitSize, requiredShares);
		console.log(shares);

		var encrypted_shares = [];
		for (var i =0; i <splitSize; i++){
			encrypted_shares[i] = chosen_workers[i].encrypt(shares[i]);
		}
		console.log(encrypted_shares);

		// place all encrypted shares to IPFS
		var shares_hash = [];
		encrypted_shares.forEach( function(encrypted_share, index) {
				$http({
					url: "/api/ipfs/add",
					method: 'POST',
					data: { "encrypted": encrypted_share }
				})
				.success(function(data) {
					console.log(data);
					shares_hash.push(data.hash);

					//finished sending all shares
					if (shares_hash.length == splitSize){
						console.log(shares_hash);
						alertHandler("Please confirm your upload transaction in MetaMask..");
						var visible = $scope.hiddenChecked;
						console.log(visible);
						var addr = [];
						addr.push($scope.userName);
						console.log(addr);

						$scope.IPFSStorage.addFile( id, visible, shares_hash, addr, {from: $scope.userName, gas: 500000 }, function(err, tx_hash){
							if (err){
								alertHandler('Transaction failed.');
							} else {
								// send confirmation emails
								$http({
									url: "/api/email/public",
									method: 'POST',
									data: { "filename": original_name, "filesize": original_size, "filetype": original_type, "filedesc": desText, "useremail": $scope.uploaderEmail, "id": id, "hash": original_file }
								})
								.success(function(data) {
									console.log(data);
								})
								.error(function(data) {
									console.log('Error: ' + data);
									bootpopup.alert("Error: " + data, "ERROR");
								});

								//reset form
								$scope.descriptionText = "";
								$scope.uploaderEmail = "";
								$scope.uploadForm.$setPristine();
								var url = "https://rinkeby.etherscan.io/tx/" + tx_hash;
								var direct = "https://project-d3.xyz/direct/" + original_file;
								
								bootpopup({
									title: "Upload - Pending Confirmation",
									size: "large",
								    	content: [
									'<div class="row" style="margin-top: 10px;"><div class="col-md-4 col-md-offset-1"><strong>File direct download link: </strong></div></div>',
									'<div class="row" style="margin-top: 10px;"><div class="col-md-10 col-md-offset-1"><div class="input-group" style="width: 100%;"><input type="text" class="form-control" id="copylink" value="' + direct + '"><div class="input-group-btn"><button class="btn btn-default" data-clipboard-target="#copylink"><i class="glyphicon glyphicon-copy"></i></button></div></div></div></div>',
									'<hr style="margin-top: 30px;">',
									'<div class="row" style="margin-top: 30px;"><div class="col-md-2 col-md-offset-1">Transaction Hash: </div><div class="col-md-9"><p><b>' + tx_hash + '</b></p></div></div>',
									'<div class="row"><div style="margin-top: 25px;" class="col-sm-12"><div class="ball-grid-pulse" style="position: relative; margin-left: auto;margin-right: auto;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>',
									'<div class="row" style="margin-top: 30px;"><div class="col-md-12 text-center">Please wait for around 20~50 seconds for the transaction to be confirmed. You may view your transaction status at:</div></div>',
									'<div class="row" style="margin-top: 5px;"><div class="col-md-12 text-center"><p><a class="link" target="_blank" href="' + url +'">'+ url +'</a></p></div></div>'
									],
									complete: function() { $window.location.href = '/'; },
								});
							}
						}); // END
					}
				})
				.error(function(data) {
					console.log('Error: ' + data);
					bootpopup.alert("Error: " + data, "ERROR");
				});
		});
	})
	.error(function(data) {
		console.log('Error: ' + data);
		bootpopup.alert("Error: " + data, "ERROR");
	});
    };

    $scope.uploadEncryptAPI = function(files, addressList) {

	//generate random passphrase for encryption
	var pw = secrets.random(256);
	console.log('File Encryption Passphrase: ' + pw);

	var desText = trim($scope.descriptionText);
	var original_name = files[0].name;
	var original_size = files[0].size;
	var original_type = files[0].type;

	convertFiles().then(results => {
		const payload = createPayload(results);
		return encryptPayload(payload, getPassphrase(pw)).then(encrypted => {
			uploadFile(encrypted);
		});
	});

    	function convertFiles(){
		return Promise.all(files.map(file => {
		    return new Promise((resolve, reject) => {
		        const reader = new FileReader;
		        reader.onload = () => resolve({ buffer: reader.result, type: file.type });
		        reader.onerror = reject;
		        reader.readAsArrayBuffer(file);
		    });
		}));
    	}

	// The payload is a Uint32Array with the following format
	// [ length of metadata as a u32 (4 bytes) | metadata | filedata ]
	function createPayload(results){
		
		const metadata = results.map(result => {
		    return { type: result.type, size: result.buffer.byteLength };
		});

		const metadataJson = JSON.stringify(metadata);

		const metadataSz = metadataJson.length * 2;
		const filedataSz = metadata.reduce((sum, md) => sum + md.size, 0);

		let payloadSz = 8 + metadataSz + filedataSz;

		if (payloadSz % 2 !== 0)
		    payloadSz += 1;

		const payload = new ArrayBuffer(payloadSz);

		const szView = new Uint32Array(payload, 0, 1);
		const mdView = new Uint16Array(payload, 4, metadataJson.lengh);
		const fdView = new Uint8Array(payload, 4 + metadataSz);

		// Write metadata JSON length as u32 (4 bytes)
		szView[0] = metadataSz;

		// Write metadata JSON string (2 bytes per charCodeAt)
		for (let i = 0, len = metadataJson.length; i < len; i++) {
		    mdView[i] = metadataJson.charCodeAt(i);
		}

		// Write filedata byte for byte
		let fdIndex = 0;

		results.forEach(result => {
		    const buf  = result.buffer;
		    const view = new Uint8Array(buf);

		    for (let i = 0, len = buf.byteLength; i < len; i++)
		        fdView[fdIndex++] = view[i];
		});

		return payload;
	}

	function encryptPayload(payload, passphrase){
		const salt = window.crypto.getRandomValues(new Uint8Array(16));

		return deriveKey(passphrase, salt).then(key => {
		    const iv = window.crypto.getRandomValues(new Uint8Array(12));
		    const algorithm = { name: 'AES-GCM', iv: iv, tagLength: 128 };

		    function writeOutput(encrypted){
		        const length = salt.byteLength + iv.byteLength + encrypted.byteLength;

		        const output = new ArrayBuffer(length);
		        const outView = new Uint8Array(output);

		        let outIndex = 0;

		        function write(bufView){
		            for (let i = 0, len = bufView.byteLength; i < len; i++){
		                outView[outIndex++] = bufView[i];
		            }
		        }

		        write(salt);
		        write(iv);
		        write(new Uint8Array(encrypted));

		        return output;
		    }

		    return window.crypto.subtle.encrypt(
		        algorithm, key, payload
		    ).then(writeOutput);
		});
	}

	function uploadFile(encrypted){
		console.log(original_name);
		console.log(original_size);
		console.log(original_type);
		console.log(addressList);
		console.log(desText);
		console.log(encrypted);

		const blob = new Blob([encrypted], { type: 'application/octet-stream' });
		console.log(blob);
		
		var payload = new FormData();
		payload.append("name", original_name);
		payload.append("size", original_size);
		payload.append("type", original_type);
		for (var i = 0; i < addressList.length; i++) {
    			payload.append("address[]", addressList[i]);
		}
		payload.append("description", desText);
		payload.append("username", $scope.userName);
		payload.append("passphrase", pw);
		payload.append("data", blob);
		
		$http({
			url: "/api/upload/private",
			method: 'POST',
			data: payload,
			headers: { 'Content-Type': undefined},
        		//prevents serializing payload
        		transformRequest: angular.identity
		})
		.success(function(data) {
			// returned IPFS hash & meta hash
		    	console.log(data);
			var target_address = data.address;			
			var target_email = data.email;
			console.log(target_address);

			var original_file = data.file_hash;
			var id = secrets.random(128);
			console.log('This file id: ' + id);

			// randomly choose worker
			var chosen_workers = getRandom(workers, splitSize);
			for (var i =0; i <splitSize; i++){
				console.log(workers.indexOf(chosen_workers[i]));
			}
			console.log(chosen_workers);

			// split and encrypt
			var metaHex = secrets.str2hex(data.meta_hash);
			var shares = secrets.share(metaHex, splitSize, requiredShares);
			console.log(shares);

			var encrypted_shares = [];
			for (var i =0; i <splitSize; i++){
				encrypted_shares[i] = chosen_workers[i].encrypt(shares[i]);
			}
			console.log(encrypted_shares);

			// place all encrypted shares to IPFS
			var shares_hash = [];
			encrypted_shares.forEach( function(encrypted_share, index) {
				$http({
					url: "/api/ipfs/add",
					method: 'POST',
					data: { "encrypted": encrypted_share }
				})
				.success(function(data) {
					console.log(data);
					shares_hash.push(data.hash);

					//finished sending all shares
					if (shares_hash.length == splitSize){
						console.log(shares_hash);
						alertHandler("Please confirm your upload transaction in MetaMask..");
						
						$scope.IPFSStorage.addFile( id, false, shares_hash, target_address, {from: $scope.userName, gas: 500000 }, function(err, tx_hash){
							if (err){
								alertHandler('Transaction failed.');
							} else {
								// send confirmation emails
								$http({
									url: "/api/email/private",
									method: 'POST',
									data: { "filename": original_name, "filesize": original_size, "filetype": original_type, "address": target_email, "filedesc": desText, "username": $scope.userName, "useremail": $scope.uploaderEmail, "id": id, "passphrase": pw, "hash": original_file }
								})
								.success(function(data) {
									console.log(data);
								})
								.error(function(data) {
									console.log('Error: ' + data);
									bootpopup.alert("Error: " + data, "ERROR");
								});

								//reset form
								$scope.recipientAddr = "";
								$scope.descriptionText = "";
								$scope.uploaderEmail = "";
								var addressElements = angular.element( document.querySelectorAll('#removable') );
								addressElements.remove();
								document.getElementById("recipientAddr").value = "";
								recipientAddr_counter = 1;
								$scope.uploadForm.$setPristine();
								var url = "https://rinkeby.etherscan.io/tx/" + tx_hash;
								var direct = "https://project-d3.xyz/direct/" + original_file;
								
								bootpopup({
									title: "Upload - Pending Confirmation",
									size: "large",
								    	content: [
									'<div class="row" style="margin-top: 10px;"><div class="col-md-4 col-md-offset-1"><strong>File direct download link: </strong></div></div>',
									'<div class="row" style="margin-top: 10px;"><div class="col-md-10 col-md-offset-1"><div class="input-group" style="width: 100%;"><input type="text" class="form-control" id="copylink" value="' + direct + '"><div class="input-group-btn"><button class="btn btn-default" data-clipboard-target="#copylink"><i class="glyphicon glyphicon-copy"></i></button></div></div></div></div>',
									'<div class="row" style="margin-top: 25px;"><div class="col-md-2 col-md-offset-1">Passphrase: </div><div class="col-md-9"><strong>' + pw + '</strong></div></div>',
									'<div class="row" style="margin-top: 5px; font-size: 12px; color: red;"><div class="col-md-12 text-center"> (You will need this passphrase for direct download with the above link!) </div></div>',
									'<hr style="margin-top: 30px;">',
									'<div class="row" style="margin-top: 30px;"><div class="col-md-2 col-md-offset-1">Transaction Hash: </div><div class="col-md-9"><p><b>' + tx_hash + '</b></p></div></div>',
									'<div class="row"><div style="margin-top: 25px;" class="col-sm-12"><div class="ball-grid-pulse" style="position: relative; margin-left: auto;margin-right: auto;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>',
									'<div class="row" style="margin-top: 30px;"><div class="col-md-12 text-center">Please wait for around 20~50 seconds for the transaction to be confirmed. You may view your transaction status at:</div></div>',
									'<div class="row" style="margin-top: 5px;"><div class="col-md-12 text-center"><p><a class="link" target="_blank" href="' + url +'">'+ url +'</a></p></div></div>'
									],
									complete: function() { $window.location.href = '/'; },
								});
							}
						});
						// END
					}
				})
				.error(function(data) {
					console.log('Error: ' + data);
					bootpopup.alert("Error: " + data, "ERROR");
				});
			});
		})
		.error(function(data) {
		    	console.log('Error: ' + data);
			bootpopup.alert("Error: " + data, "ERROR");
		});
	}

    };
    //////////////// Web3 API END

    $scope.uploadPublic = function(files) {

	var desText = trim($scope.descriptionText);
	var id = secrets.random(128);
	console.log('This file id: ' + id);

	var payload = new FormData();
	payload.append("id", id);
	payload.append("username", $scope.userName);
	payload.append("useremail", $scope.uploaderEmail);
	payload.append("token", $scope.userToken);
	payload.append("tokenProvider", $scope.userProvider);
	payload.append("visible", $scope.hiddenChecked);
	payload.append("description", desText);
	payload.append("data", files[0]);

	$http({
		url: "/uploadPublic",
		method: 'POST',
		data: payload,
		headers: { 'Content-Type': undefined },
        	//prevents serializing payload
        	transformRequest: angular.identity
	})
	.success(function(data) {
		console.log(data);
		//reset form
		$scope.descriptionText = "";
		$scope.uploaderEmail = "";
		$scope.uploadForm.$setPristine();
		var url = "https://rinkeby.etherscan.io/tx/" + data.tx_hash;
		var direct = "https://project-d3.xyz/direct/" + data.file_hash;
		bootpopup({
			title: "Upload - Pending Confirmation",
			size: "large",
		    	content: [
				'<div class="row" style="margin-top: 10px;"><div class="col-md-4 col-md-offset-1"><strong>File direct download link: </strong></div></div>',
				'<div class="row" style="margin-top: 10px;"><div class="col-md-10 col-md-offset-1"><div class="input-group" style="width: 100%;"><input type="text" class="form-control" id="copylink" value="' + direct + '"><div class="input-group-btn"><button class="btn btn-default" data-clipboard-target="#copylink"><i class="glyphicon glyphicon-copy"></i></button></div></div></div></div>',
				'<hr style="margin-top: 30px;">',
				'<div class="row" style="margin-top: 30px;"><div class="col-md-2 col-md-offset-1">Transaction Hash: </div><div class="col-md-9"><p><b>' + data.tx_hash + '</b></p></div></div>',
				'<div class="row"><div style="margin-top: 25px;" class="col-sm-12"><div class="ball-grid-pulse" style="position: relative; margin-left: auto;margin-right: auto;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>',
				'<div class="row" style="margin-top: 30px;"><div class="col-md-12 text-center">Please wait for around 20~50 seconds for the transaction to be confirmed. You may view your transaction status at:</div></div>',
				'<div class="row" style="margin-top: 5px;"><div class="col-md-12 text-center"><p><a class="link" target="_blank" href="' + url +'">'+ url +'</a></p></div></div>'
			],
			complete: function() { $window.location.href = '/'; },
		});
	})
	.error(function(data) {
		console.log('Error: ' + data);
		bootpopup.alert("Error: " + data, "ERROR");
	});
    };

    $scope.uploadEncrypt = function(files, addressList) {
	
	var id = secrets.random(128);
	console.log('This file id: ' + id);

	//generate random passphrase for encryption
	var pw = secrets.random(256);
	console.log('File Encryption Passphrase: ' + pw);

	var desText = trim($scope.descriptionText);
	var original_name = files[0].name;
	var original_size = files[0].size;
	var original_type = files[0].type;

	convertFiles().then(results => {
		const payload = createPayload(results);
		return encryptPayload(payload, getPassphrase(pw)).then(encrypted => {
			uploadFile(encrypted);
		});
	});

    	function convertFiles(){
		return Promise.all(files.map(file => {
		    return new Promise((resolve, reject) => {
		        const reader = new FileReader;
		        reader.onload = () => resolve({ buffer: reader.result, type: file.type });
		        reader.onerror = reject;
		        reader.readAsArrayBuffer(file);
		    });
		}));
    	}

	// The payload is a Uint32Array with the following format
	// [ length of metadata as a u32 (4 bytes) | metadata | filedata ]
	function createPayload(results){
		
		const metadata = results.map(result => {
		    return { type: result.type, size: result.buffer.byteLength };
		});

		const metadataJson = JSON.stringify(metadata);

		const metadataSz = metadataJson.length * 2;
		const filedataSz = metadata.reduce((sum, md) => sum + md.size, 0);

		let payloadSz = 8 + metadataSz + filedataSz;

		if (payloadSz % 2 !== 0)
		    payloadSz += 1;

		const payload = new ArrayBuffer(payloadSz);

		const szView = new Uint32Array(payload, 0, 1);
		const mdView = new Uint16Array(payload, 4, metadataJson.lengh);
		const fdView = new Uint8Array(payload, 4 + metadataSz);

		// Write metadata JSON length as u32 (4 bytes)
		szView[0] = metadataSz;

		// Write metadata JSON string (2 bytes per charCodeAt)
		for (let i = 0, len = metadataJson.length; i < len; i++) {
		    mdView[i] = metadataJson.charCodeAt(i);
		}

		// Write filedata byte for byte
		let fdIndex = 0;

		results.forEach(result => {
		    const buf  = result.buffer;
		    const view = new Uint8Array(buf);

		    for (let i = 0, len = buf.byteLength; i < len; i++)
		        fdView[fdIndex++] = view[i];
		});

		return payload;
	}

	function encryptPayload(payload, passphrase){
		const salt = window.crypto.getRandomValues(new Uint8Array(16));

		return deriveKey(passphrase, salt).then(key => {
		    const iv = window.crypto.getRandomValues(new Uint8Array(12));
		    const algorithm = { name: 'AES-GCM', iv: iv, tagLength: 128 };

		    function writeOutput(encrypted){
		        const length = salt.byteLength + iv.byteLength + encrypted.byteLength;

		        const output = new ArrayBuffer(length);
		        const outView = new Uint8Array(output);

		        let outIndex = 0;

		        function write(bufView){
		            for (let i = 0, len = bufView.byteLength; i < len; i++){
		                outView[outIndex++] = bufView[i];
		            }
		        }

		        write(salt);
		        write(iv);
		        write(new Uint8Array(encrypted));

		        return output;
		    }

		    return window.crypto.subtle.encrypt(
		        algorithm, key, payload
		    ).then(writeOutput);
		});
	}

	function uploadFile(encrypted){
		console.log(original_name);
		console.log(original_size);
		console.log(original_type);
		console.log(addressList);
		console.log(desText);
		console.log(encrypted);

		const blob = new Blob([encrypted], { type: 'application/octet-stream' });
		console.log(blob);
		
		var payload = new FormData();
		payload.append("token", $scope.userToken);
		payload.append("tokenProvider", $scope.userProvider);
		payload.append("id", id);
		payload.append("name", original_name);
		payload.append("size", original_size);
		payload.append("type", original_type);
		for (var i = 0; i < addressList.length; i++) {
    			payload.append("address[]", addressList[i]);
		}
		payload.append("description", desText);
		payload.append("username", $scope.userName);
		payload.append("useremail", $scope.uploaderEmail);
		payload.append("passphrase", pw);
		payload.append("data", blob);
		
		$http({
			url: "/uploadEncrypt",
			method: 'POST',
			data: payload,
			headers: { 'Content-Type': undefined },
        		//prevents serializing payload
        		transformRequest: angular.identity
		})
		.success(function(data) {
		    	console.log(data);
			//reset form
			$scope.recipientAddr = "";
			$scope.descriptionText = "";
			$scope.uploaderEmail = "";
			var addressElements = angular.element( document.querySelectorAll('#removable') );
			addressElements.remove();
			document.getElementById("recipientAddr").value = "";
			recipientAddr_counter = 1;
			$scope.uploadForm.$setPristine();

			var url = "https://rinkeby.etherscan.io/tx/" + data.tx_hash;
			var direct = "https://project-d3.xyz/direct/" + data.file_hash;
			bootpopup({
				title: "Private Upload - Pending Confirmation",
				size: "large",
			    	content: [
				'<div class="row" style="margin-top: 10px;"><div class="col-md-4 col-md-offset-1"><strong>File direct download link: </strong></div></div>',
				'<div class="row" style="margin-top: 10px;"><div class="col-md-10 col-md-offset-1"><div class="input-group" style="width: 100%;"><input type="text" class="form-control" id="copylink" value="' + direct + '"><div class="input-group-btn"><button class="btn btn-default" data-clipboard-target="#copylink"><i class="glyphicon glyphicon-copy"></i></button></div></div></div></div>',
				'<div class="row" style="margin-top: 25px;"><div class="col-md-2 col-md-offset-1">Passphrase: </div><div class="col-md-9"><strong>' + pw + '</strong></div></div>',
				'<div class="row" style="margin-top: 5px; font-size: 12px; color: red;"><div class="col-md-12 text-center"> (You will need this passphrase for direct download with the above link!) </div></div>',
				'<hr style="margin-top: 30px;">',
				'<div class="row" style="margin-top: 30px;"><div class="col-md-2 col-md-offset-1">Transaction Hash: </div><div class="col-md-9"><p><b>' + data.tx_hash + '</b></p></div></div>',
				'<div class="row"><div style="margin-top: 25px;" class="col-sm-12"><div class="ball-grid-pulse" style="position: relative; margin-left: auto;margin-right: auto;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>',
				'<div class="row" style="margin-top: 30px;"><div class="col-md-12 text-center">Please wait for around 20~50 seconds for the transaction to be confirmed. You may view your transaction status at:</div></div>',
				'<div class="row" style="margin-top: 5px;"><div class="col-md-12 text-center"><p><a class="link" target="_blank" href="' + url +'">'+ url +'</a></p></div></div>'
				],
				complete: function() { $window.location.href = '/'; },
			});
		})
		.error(function(data) {
		    	console.log('Error: ' + data);
			bootpopup.alert("Error: " + data, "ERROR");
		});
	}

    };

    $scope.changeHidden = function(x) {
	x.disabled = true;
	if ($scope.isWeb3){
		alertHandler("Please confirm your transaction in MetaMask..");
		$scope.IPFSStorage.setVisible( x.id, !x.visible, {from: $scope.userName, gas: 500000 }, function(err, tx_hash){
			if (err){
				alertHandler('Transaction failed.');
				x.disabled = false;
			} else {
				var url = "https://rinkeby.etherscan.io/tx/" + tx_hash;
				bootpopup({
					title: "Change Visibility - Pending Confirmation",
					size: "large",
				   	content: [
						'<div class="row" style="margin-top: 20px;"><div class="col-md-2 col-md-offset-1">Transaction Hash: </div><div class="col-md-9"><p><b>' + tx_hash + '</b></p></div></div>',
						'<div class="row"><div style="margin-top: 25px;" class="col-sm-12"><div class="ball-grid-pulse" style="position: relative; margin-left: auto;margin-right: auto;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>',
						'<div class="row" style="margin-top: 30px;"><div class="col-md-12 text-center">Please wait for around 20~50 seconds for the transaction to be confirmed. You may view your transaction status at:</div></div>',
						'<div class="row" style="margin-top: 5px; margin-bottom: 20px;"><div class="col-md-12 text-center"><p><a class="link" target="_blank" href="' + url +'">'+ url +'</a></p></div></div>',
					],
					complete: function() { $scope.$apply(); }
				});
			}
		});

	} else {
		$http({
			url: "/setFileVisble",
			method: 'POST',
			data: { "id": x.id, "value": !x.visible, "token": $scope.userToken, "tokenProvider": $scope.userProvider}
		})
		.success(function(data) {
			console.log(data);
			var url = "https://rinkeby.etherscan.io/tx/" + data.tx_hash;
			bootpopup({
				title: "Change Visibility - Pending Confirmation",
				size: "large",
			   	content: [
					'<div class="row" style="margin-top: 20px;"><div class="col-md-2 col-md-offset-1">Transaction Hash: </div><div class="col-md-9"><p><b>' + data.tx_hash + '</b></p></div></div>',
					'<div class="row"><div style="margin-top: 25px;" class="col-sm-12"><div class="ball-grid-pulse" style="position: relative; margin-left: auto;margin-right: auto;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>',
					'<div class="row" style="margin-top: 30px;"><div class="col-md-12 text-center">Please wait for around 20~50 seconds for the transaction to be confirmed. You may view your transaction status at:</div></div>',
					'<div class="row" style="margin-top: 5px; margin-bottom: 20px;"><div class="col-md-12 text-center"><p><a class="link" target="_blank" href="' + url +'">'+ url +'</a></p></div></div>',
				]
			});
		})
		.error(function(data) {
			console.log('Error: ' + data);
			bootpopup.alert("Error: " + data, "ERROR");
			x.disabled = false;
		});
	}
    };

    $scope.deleteFile = function(x) {
	bootpopup.confirm("Do you wish to delete "+ x.filename +"?", "Confirm file deletion", function(ans) { 
		if (ans == true){
			x.deleted = true;
			if ($scope.isWeb3){
				// find the index from logs
				var pastEvent = $scope.IPFSStorage.confirmFileIndexID({id: x.id}, {fromBlock: 0, toBlock: 'latest'});
				pastEvent.get( function(err, ev_result) {
					if (err) {
						x.deleted = false;
						console.log(err);
					} else {
						console.log(ev_result);
						var index = ev_result[ev_result.length-1].args.index.toLocaleString();
						pastEvent.stopWatching(function(err, result){
							if (err){
								console.log('Event watcher failed to stop.');
							}
						});
						console.log(index);
						// delete localfile and upin from IPFS
						$http({
							url: "/api/ipfs/delete",
							method: 'POST',
							data: { "id": x.id, "signature": $scope.userSignature, "localname": x.localname, "meta": x.meta, "hash": x.hash }
						})
						.success(function(data) {
							console.log(data);
							alertHandler("Please confirm your file delete transaction in MetaMask..");
							if (!x.hasOwnProperty("recipients")){
								var temp = [];
								temp.push($scope.userName);
								x["recipients"] = temp;
							}
							console.log(x.recipients);
							var recipient_addr = [];
							for (var i = 0; i < x.recipients.length; i++){
								if (isValidAddress(x.recipients[i]) && !recipient_addr.includes(x.recipients[i]) ){
									recipient_addr.push(x.recipients[i]);
								} else if (isValidEmail(x.recipients[i]) && !recipient_addr.includes($scope.infoAddress) ){
									recipient_addr.push($scope.infoAddress);
								}
							}
							console.log(recipient_addr);
							$scope.IPFSStorage.deleteFile( index, x.id, recipient_addr, {from: $scope.userName, gas: 500000 }, function(err, tx_hash){
								if (err){
									x.deleted = false;
									alertHandler('Transaction failed.');
								} else {
									var url = "https://rinkeby.etherscan.io/tx/" + tx_hash;
									bootpopup({
										title: "File Deletion - Pending Confirmation",
										size: "large",
										content: [
											'<div class="row" style="margin-top: 20px;"><div class="col-md-2 col-md-offset-1">Transaction Hash: </div><div class="col-md-9"><p><b>' + tx_hash + '</b></p></div></div>',
											'<div class="row"><div style="margin-top: 25px;" class="col-sm-12"><div class="ball-grid-pulse" style="position: relative; margin-left: auto;margin-right: auto;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>',
											'<div class="row" style="margin-top: 30px;"><div class="col-md-12 text-center">Please wait for around 20~50 seconds for the transaction to be confirmed. You may view your transaction status at:</div></div>',
											'<div class="row" style="margin-top: 5px; margin-bottom: 20px;"><div class="col-md-12 text-center"><p><a class="link" target="_blank" href="' + url +'">'+ url +'</a></p></div></div>',
										],
										complete: function() { $scope.$apply(); }
									});
								}
							});
						})
						.error(function(data) {
							console.log('Error: ' + data);
							bootpopup.alert("Error: " + data, "ERROR");
							x.deleted = false;
						});
					}
				});

			} else {
				$http({
					url: "/deleteFile",
					method: 'POST',
					data: { "id": x.id, "token": $scope.userToken, "tokenProvider": $scope.userProvider}
				})
				.success(function(data) {
					console.log(data);
					if (x.hasOwnProperty("passphrase")){
						var index = $scope.pfiles.indexOf(x);
						if (index > -1) {
							$scope.pfiles.splice(index, 1);
						}
					} else {
						var index = $scope.pubfiles.indexOf(x);
						if (index > -1) {
							$scope.pubfiles.splice(index, 1);
						}
					}
					
					var url = "https://rinkeby.etherscan.io/tx/" + data.tx_hash;
					bootpopup({
						title: "File Deletion - Pending Confirmation",
						size: "large",
					   	content: [
							'<div class="row" style="margin-top: 20px;"><div class="col-md-2 col-md-offset-1">Transaction Hash: </div><div class="col-md-9"><p><b>' + data.tx_hash + '</b></p></div></div>',
							'<div class="row"><div style="margin-top: 25px;" class="col-sm-12"><div class="ball-grid-pulse" style="position: relative; margin-left: auto;margin-right: auto;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>',
							'<div class="row" style="margin-top: 30px;"><div class="col-md-12 text-center">Please wait for around 20~50 seconds for the transaction to be confirmed. You may view your transaction status at:</div></div>',
							'<div class="row" style="margin-top: 5px; margin-bottom: 20px;"><div class="col-md-12 text-center"><p><a class="link" target="_blank" href="' + url +'">'+ url +'</a></p></div></div>',
						]
					});
				})
				.error(function(data) {
					console.log('Error: ' + data);
					bootpopup.alert("Error: " + data, "ERROR");
					x.deleted = false;
				});
			}
		}
	});
    };

    $scope.decryptPrivateFile = function() {
	bootpopup({
		title: "Private File Decryption",
	    	size: "large",
	    	size_labels: "col-sm-2",
	    	size_inputs: "col-sm-10",
	    	content: [
			{ input: {type: "file", label: "Encrypted File", name: "decryptFile", id: "decryptFile"}},
			{ input: {type: "password", label: "Password", name: "password", id: "password"}}

		],
		cancel: function(data, array, event){},
    		ok: function(data, array, event) {
			console.log($('#decryptFile').val());
			if ( $('#decryptFile').val() == undefined || $('#decryptFile').val() == '' || $('#decryptFile').val() == null){
				bootpopup.alert("Please upload a file for decryption.", "Invalid file");
				return;
			}

			if (data.password.length < 8){
				bootpopup.alert("Please enter a valid decryption passphrase (at least 8 characters)!", "Invalid passphrase");
				return;
			}

			var file = $('#decryptFile').prop('files')[0];
			var pw = data.password;
			console.log(file);

			convertFile(file).then(buffer => {
				return decryptPayload(buffer, getPassphrase(pw)).then(process);
			}).catch(alertHandler);
		}
	});

	function convertFile(file){
		return new Promise((resolve, reject) => {
		    const reader = new FileReader;
		    reader.onload = () => resolve(reader.result);
		    reader.onerror = reject;
		    reader.readAsArrayBuffer(file);
		});
	}

	function decryptPayload(payload, passphrase){
		const view = new Uint8Array(payload);
		const salt = view.slice(0, 16);
		const iv = view.slice(16, 16 + 12);

		const ciphertext = new Uint8Array(payload, 16 + 12);

		return deriveKey(passphrase, salt).then(key => {
		    const algorithm = { name: 'AES-GCM', iv: iv, tagLength: 128 };

		    return window.crypto.subtle.decrypt(
		        algorithm, key, ciphertext
		    ).catch(() => Promise.reject('File decryption failed. Invalid passphrase!'));
		});
	}

	function process(payload){
		const szView = new Uint32Array(payload, 0, 1);
		const metadataSz = szView[0];

		const mdView = new Uint16Array(payload, 4, (metadataSz / 2));
		const fdView = new Uint8Array(payload, 4 + metadataSz);

		const metadata = JSON.parse(String.fromCharCode.apply(null, mdView));

		let fdIndex = 0;

		metadata.forEach(file => {
			const fileBuf = new ArrayBuffer(file.size);
			const fileView = new Uint8Array(fileBuf);

			for (let i = 0, len = file.size; i < len; i++){
				fileView[i] = fdView[fdIndex++];
			}
			
			saveAsFile('decrypted', fileBuf, file.type );
		});
	}

	function saveAsFile(fileName, fileBuf, fileType){
		const blob = new Blob([fileBuf], { type: fileType });
		const url = window.URL.createObjectURL(blob);

		const anchor = document.getElementById('download');

		anchor.href = url;
		anchor.download = fileName;
		anchor.click();

		window.URL.revokeObjectURL(url);
	}
    };

    $scope.removeRecipient = function(y, z) {
	bootpopup.confirm("Do you wish to revoke the access right for "+ z +"?", "Confirm remove recipient", function(ans) { 
		if (ans == true){
			y.disabled = true;
			if ($scope.isWeb3){
				// create and upload new meta
				var targetIndex = y.recipients.indexOf(z);
				if (targetIndex > -1) {
				    y.recipients.splice(targetIndex, 1);
				}
				console.log(y);

				var addrList = [];
				if (isValidAddress(z)){
					addrList.push(z);
				} else {
					var count = 0;
					for (var i = 0; i < y.recipients.length; i++){
						if (isValidEmail( y.recipients[i] )){
							count++;
						}
					}
					if (count == 0){
						addrList.push($scope.infoAddress);
					}
				}
				console.log(addrList);

				$http({
					url: "/api/upload/meta",
					method: 'POST',
					data: { meta: y }
				})
				.success(function(data) {
					// returned meta hash
					console.log(data);

					// randomly choose worker
					var chosen_workers = getRandom(workers, splitSize);
					for (var i =0; i <splitSize; i++){
						console.log(workers.indexOf(chosen_workers[i]));
					}
					console.log(chosen_workers);

					// split and encrypt
					var metaHex = secrets.str2hex(data.meta_hash);
					var shares = secrets.share(metaHex, splitSize, requiredShares);
					console.log(shares);

					var encrypted_shares = [];
					for (var i =0; i <splitSize; i++){
						encrypted_shares[i] = chosen_workers[i].encrypt(shares[i]);
					}
					console.log(encrypted_shares);

					// place all encrypted shares to IPFS
					var shares_hash = [];
					encrypted_shares.forEach( function(encrypted_share, index) {
						$http({
							url: "/api/ipfs/add",
							method: 'POST',
							data: { "encrypted": encrypted_share }
						})
						.success(function(data) {
							console.log(data);
							shares_hash.push(data.hash);

							//finished sending all shares
							if (shares_hash.length == splitSize){
								console.log(shares_hash);
								alertHandler("Please confirm your remove recipient transaction in MetaMask..");
								$scope.IPFSStorage.setRecipients(y.id, shares_hash, addrList, false, {from: $scope.userName, gas: 500000 }, function(err, tx_hash){
									if (err){
										alertHandler('Transaction failed.');
									} else {
										var url = "https://rinkeby.etherscan.io/tx/" + tx_hash;
										bootpopup({
											title: "Remove Recipient - Pending Confirmation",
											size: "large",
										   	content: [
												'<div class="row" style="margin-top: 20px;"><div class="col-md-2 col-md-offset-1">Transaction Hash: </div><div class="col-md-9"><p><b>' + tx_hash + '</b></p></div></div>',
												'<div class="row"><div style="margin-top: 25px;" class="col-sm-12"><div class="ball-grid-pulse" style="position: relative; margin-left: auto;margin-right: auto;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>',
												'<div class="row" style="margin-top: 30px;"><div class="col-md-12 text-center">Please wait for around 20~50 seconds for the transaction to be confirmed. You may view your transaction status at:</div></div>',
												'<div class="row" style="margin-top: 5px; margin-bottom: 20px;"><div class="col-md-12 text-center"><p><a class="link" target="_blank" href="' + url +'">'+ url +'</a></p></div></div>',
											]
										});
									}
								});
							}
						})
						.error(function(data) {
							console.log('Error: ' + data);
							bootpopup.alert("Error: " + data, "ERROR");
							y.disabled = false;
						});
					}); // END forEach
				})
				.error(function(data) {
					console.log('Error: ' + data);
					bootpopup.alert("Error: " + data, "ERROR");
					y.disabled = false;
				});
				// END Web3
			} else {
				$http({
					url: "/removeRecipient",
					method: 'POST',
					data: { "id": y.id, "address": z, "token": $scope.userToken, "tokenProvider": $scope.userProvider}
				})
				.success(function(data) {
					console.log(data);
					var targetIndex = y.recipients.indexOf(z);
					if (targetIndex > -1) {
					    y.recipients.splice(targetIndex, 1);
					}
					var url = "https://rinkeby.etherscan.io/tx/" + data.tx_hash;
					bootpopup({
						title: "Remove Recipient - Pending Confirmation",
						size: "large",
					   	content: [
							'<div class="row" style="margin-top: 20px;"><div class="col-md-2 col-md-offset-1">Transaction Hash: </div><div class="col-md-9"><p><b>' + data.tx_hash + '</b></p></div></div>',
							'<div class="row"><div style="margin-top: 25px;" class="col-sm-12"><div class="ball-grid-pulse" style="position: relative; margin-left: auto;margin-right: auto;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>',
							'<div class="row" style="margin-top: 30px;"><div class="col-md-12 text-center">Please wait for around 20~50 seconds for the transaction to be confirmed. You may view your transaction status at:</div></div>',
							'<div class="row" style="margin-top: 5px; margin-bottom: 20px;"><div class="col-md-12 text-center"><p><a class="link" target="_blank" href="' + url +'">'+ url +'</a></p></div></div>',
						]
					});
				})
				.error(function(data) {
					console.log('Error: ' + data);
					bootpopup.alert("Error: " + data, "ERROR");
					y.disabled = false;
				});
			}
		}
	});
    };

    $scope.addRecipient = function(y) {
	bootpopup({
		title: "Add Recipient",
	    	size: "large",
	    	size_labels: "col-sm-2",
	    	size_inputs: "col-sm-10",
	    	content: [{ input: {type: "text", label: "Address", name: "address", id: "address", placeholder: "(Ethereum OR email address)"}}],
		cancel: function(data, array, event){},
    		ok: function(data, array, event) {
			if (!isValidAddress(data.address) && !isValidEmail(data.address)){
				bootpopup.alert("Please enter a valid Ethereum/email address!", "Invalid recipient - " + data.address);
				return;
			}
			y.disabled = true;
			var target_address = data.address;

			if ($scope.isWeb3){
				
				// create and upload new meta
				y.recipients.push(target_address);
				console.log(y);

				var addrList = [];
				if (isValidAddress(target_address)){
					addrList.push(target_address);
				} else {
					addrList.push($scope.infoAddress);
				}
				console.log(addrList);

				$http({
					url: "/api/upload/meta",
					method: 'POST',
					data: { meta: y }
				})
				.success(function(data) {
					// returned meta hash
					console.log(data);

					// randomly choose worker
					var chosen_workers = getRandom(workers, splitSize);
					for (var i =0; i <splitSize; i++){
						console.log(workers.indexOf(chosen_workers[i]));
					}
					console.log(chosen_workers);

					// split and encrypt
					var metaHex = secrets.str2hex(data.meta_hash);
					var shares = secrets.share(metaHex, splitSize, requiredShares);
					console.log(shares);

					var encrypted_shares = [];
					for (var i =0; i <splitSize; i++){
						encrypted_shares[i] = chosen_workers[i].encrypt(shares[i]);
					}
					console.log(encrypted_shares);

					// place all encrypted shares to IPFS
					var shares_hash = [];
					encrypted_shares.forEach( function(encrypted_share, index) {
						$http({
							url: "/api/ipfs/add",
							method: 'POST',
							data: { "encrypted": encrypted_share }
						})
						.success(function(data) {
							console.log(data);
							shares_hash.push(data.hash);

							//finished sending all shares
							if (shares_hash.length == splitSize){
								console.log(shares_hash);
								alertHandler("Please confirm your add recipient transaction in MetaMask..");
								$scope.IPFSStorage.setRecipients(y.id, shares_hash, addrList, true, {from: $scope.userName, gas: 500000 }, function(err, tx_hash){
									if (err){
										alertHandler('Transaction failed.');
									} else {
										if (isValidEmail(target_address)){
										// send confirmation email if valid
											$http({
												url: "/api/email/add",
												method: 'POST',
												data: { "filename": y.filename, "filesize": y.size, "filetype": y.mimetype, "address": target_address, "filedesc": y.description, "username": $scope.userName, "useremail": $scope.uploaderEmail, "id": y.id }
											})
											.success(function(data) {
												console.log(data);
											})
											.error(function(data) {
												console.log('Error: ' + data);
											});
										}
										var url = "https://rinkeby.etherscan.io/tx/" + tx_hash;
										bootpopup({
											title: "Add Recipient - Pending Confirmation",
											size: "large",
										   	content: [
												'<div class="row" style="margin-top: 20px;"><div class="col-md-2 col-md-offset-1">Transaction Hash: </div><div class="col-md-9"><p><b>' + tx_hash + '</b></p></div></div>',
												'<div class="row"><div style="margin-top: 25px;" class="col-sm-12"><div class="ball-grid-pulse" style="position: relative; margin-left: auto;margin-right: auto;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>',
												'<div class="row" style="margin-top: 30px;"><div class="col-md-12 text-center">Please wait for around 20~50 seconds for the transaction to be confirmed. You may view your transaction status at:</div></div>',
												'<div class="row" style="margin-top: 5px; margin-bottom: 20px;"><div class="col-md-12 text-center"><p><a class="link" target="_blank" href="' + url +'">'+ url +'</a></p></div></div>',
											]
										});
									}
								});
							}
						})
						.error(function(data) {
							console.log('Error: ' + data);
							bootpopup.alert("Error: " + data, "ERROR");
							y.disabled = false;
						});
					}); // END forEach
				})
				.error(function(data) {
					console.log('Error: ' + data);
					bootpopup.alert("Error: " + data, "ERROR");
					y.disabled = false;
				});
				// END Web3

			} else {
				$http({
					url: "/addRecipient",
					method: 'POST',
					data: { "id": y.id, "address": target_address, "token": $scope.userToken, "tokenProvider": $scope.userProvider, "username": $scope.userName }
				})
				.success(function(data) {
					console.log(data);
					y.recipients.push(target_address);
					var url = "https://rinkeby.etherscan.io/tx/" + data.tx_hash;
					bootpopup({
						title: "Add Recipient - Pending Confirmation",
						size: "large",
					   	content: [
							'<div class="row" style="margin-top: 20px;"><div class="col-md-2 col-md-offset-1">Transaction Hash: </div><div class="col-md-9"><p><b>' + data.tx_hash + '</b></p></div></div>',
							'<div class="row"><div style="margin-top: 25px;" class="col-sm-12"><div class="ball-grid-pulse" style="position: relative; margin-left: auto;margin-right: auto;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>',
							'<div class="row" style="margin-top: 30px;"><div class="col-md-12 text-center">Please wait for around 20~50 seconds for the transaction to be confirmed. You may view your transaction status at:</div></div>',
							'<div class="row" style="margin-top: 5px; margin-bottom: 20px;"><div class="col-md-12 text-center"><p><a class="link" target="_blank" href="' + url +'">'+ url +'</a></p></div></div>',
						]
					});
				})
				.error(function(data) {
					console.log('Error: ' + data);
					bootpopup.alert("Error: " + data, "ERROR");
					y.disabled = false;
				});
			}
		}
	});
    };

    $scope.sendFeedback = function() {
	
	if ($scope.contactEmail != "" && !isValidEmail($scope.contactEmail)){
		bootpopup.alert("Oops! Your email address is invalid!", "Invalid email");
		return;
	}
	var name = $scope.contactName;
	var email = $scope.contactEmail;
	var message = trim($scope.contactMsg);

	$http({
		url: "/sendFeedback",
		method: 'POST',
		data: { "name": name, "email": email, "message": message}
	})
	.success(function(data) {
		console.log(data);
		bootpopup.alert("Your message was sent successfully!", "Thank You :)");
		$scope.contactName = "";
		$scope.contactEmail = "";
		$scope.contactMsg = "";
		$scope.msgForm.$setPristine();
	})
	.error(function(data) {
		console.log('Error: ' + data);
		bootpopup.alert("Error: " + data, "ERROR");
	});
    };

    $scope.getInfo = function() {
	$http.get("/getInfo")
		.success(function(data) {
			$scope.infoContract = data.contract;
			$scope.infoAddress = data.address;
			$scope.infoBalance = data.balance.toFixed(3);
			console.log(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
			bootpopup.alert("Error: " + data, "ERROR");
		});
    }

    $scope.humanFileSize = function(bytes) {
	var thresh = 1000;
	if(Math.abs(bytes) < thresh) {
		return bytes + ' B';
	}
	var units = ['kB','MB','GB','TB','PB','EB','ZB','YB'];
	var u = -1;
	do {
		bytes /= thresh;
		++u;
	} while(Math.abs(bytes) >= thresh && u < units.length - 1);
    	return bytes.toFixed(1)+' '+units[u];
    }

    //Init functions
    angular.element(document).ready(function () {
	if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
		$scope.isWeb3 = true;
		web3 = new Web3(window.web3.currentProvider);
		web3.eth.getAccounts(function(err, accounts){
			if (err != null){
				alertHandler("ERROR: " + err);
				$scope.isWeb3 = false;

			} else if (accounts.length == 0){
				bootpopup({
					title: "MetaMask Login",
				    	content: [
					'<strong>Please login to MetaMask and use Rinkeby testnet to continue!</strong>'
					],
					complete: function() {
						$window.location.href = '/'; 
					}
				});

			} else {
				console.log("User logged in to MetaMask: " + accounts[0]);
				$scope.isLoggedIn = true;
				$scope.userName = accounts[0];
				$scope.userPhoto = '/image/eth_icon.png';
				$http.get("/contract")
				.success(function(data) {
					$scope.infoContract = data.contract;
					$scope.infoContractABI = data.abi;
					$scope.infoAddress = data.address;
					console.log(data);
					$scope.IPFSStorage = web3.eth.contract(data.abi).at(data.contract);
					console.log("Loaded Contract deployed at: " + data.contract);
					
					if ($scope.infoAddress == $scope.userName){
						$scope.isAdmin = true
					}
					//check if signature provided before
					var session = sessionStorage.getItem("signature");
					console.log(session);
					if (session) {
						$scope.isProvidedSignature = true;
						var userDetails = JSON.parse(session);
						$scope.userSignature = userDetails.signature;
					} else {
					    	$scope.isProvidedSignature = false;
					}

					if ($scope.inView){
						$scope.getFileListAPI();
					}
					if ($scope.inManage){
						$scope.getOwnFileListAPI();
					}
					if ($scope.inAdmin && $scope.isAdmin){
						$scope.getAdminLogs();
					}
				})
				.error(function(data) {
					console.log('Error: ' + data);
					bootpopup.alert("Error: " + data, "ERROR");
				});

				$scope.$apply();
			}
		});

	} else {
		//check if logged in
		var session = sessionStorage.getItem("user");
		console.log(session);
		if (session) {
			$scope.isLoggedIn = true;
			var userDetails = JSON.parse(session);
			$scope.userName = userDetails.name;
			$scope.userEmail = userDetails.email;
			$scope.userPhoto = userDetails.imageUrl;
			$scope.userToken = userDetails.token;
			$scope.userProvider = userDetails.provider;
			$scope.contactName = userDetails.name;
			$scope.contactEmail = userDetails.email;
			if ($scope.inManage){
				$scope.getOwnFileList();
			}
		} else {
		    	$scope.isLoggedIn = false;
		}
		if ($scope.inView){
			$scope.getFileList();
		}
		$scope.$apply();
	}
    });
    
    $scope.initIndex = function() {
	checkBrowserSupport();
    }

    $scope.initAbout = function() {
	if (!(typeof window !== 'undefined' && typeof window.web3 !== 'undefined')) {
		$scope.getInfo();
	}
    }

    $scope.initView = function() {
	$scope.inView = true;
    }

    $scope.initManage = function() {
	$scope.inManage = true;
    }

    $scope.initAdmin = function() {
	$scope.inAdmin = true;
    }
}

function alertHandler(error) {
    bootpopup.alert(error);
}

function GetSortOrder(prop) {
    // Ascending Comparer Function
    if (prop == "filename" || prop == "mimetype" || prop == "id" || prop == "sender"){
	return function(a, b) {  
		if (a[prop] > b[prop]) {  
			return 1;  
		} else if (a[prop] < b[prop]) {  
			return -1;  
		}  
			return 0;  
	}
    } else {
	// Descending Comparer Function
	return function(a, b) {  
		if (a[prop] > b[prop]) {  
			return -1;  
		} else if (a[prop] < b[prop]) {  
			return 1;  
		}  
			return 0;
	}
    } 
}

function removeDuplicates(originalArray, objKey) {
  var trimmedArray = [];
  var values = [];
  var value;

  for(var i = originalArray.length - 1; i >= 0; i--) {
    value = originalArray[i][objKey];

    if(values.indexOf(value) === -1) {
      trimmedArray.push(originalArray[i]);
      values.push(value);
    }
  }

  return trimmedArray;
}

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function charLimit(limitField, limitNum) {
    if (limitField.value.length > limitNum) {
	limitField.value = trim(limitField.value).substring(0, limitNum);
    }
}

function trim(value){
    return value.replace(/[^a-zA-Z\n 0-9.,?~!@#$%^&*()\-=_+|<>?":';/\\[\]{}]|^\s+|\s+$/g,"");
}

function checkBrowserSupport(){
    const ua = (navigator && navigator.userAgent) || '';
    const hasCrypto = 'crypto' in window;
    const hasSubtleCrypto = 'subtle' in window.crypto;

    if (!('crypto' in window) || !('subtle' in window.crypto) || !('Blob' in window) ){
	alertHandler("ERROR: Your current browser is not supported! You will NOT be able to upload or download encrypted files..");
    }
}

function toAscii(hex){
    var str = '', i = 0, l = hex.length;
    if (hex.substring(0, 2) === '0x') {
        i = 2;
    }
    for (; i < l; i+=2) {
        var code = parseInt(hex.substr(i, 2), 16);
        if (code === 0) continue; // this is added
        str += String.fromCharCode(code);
    }
    return str;
};

function isValidAddress(str) {
    return /^0x[a-fA-F0-9]{40}$/.test(str);
}

function isValidEmail(str) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(str);
}

function isValidByte32(data){
    return (data != '0x' && data != '0x0000000000000000000000000000000000000000000000000000000000000000');
}

function getPassphrase(pw){
    const passphrase = pw;

    const buf = new ArrayBuffer(passphrase.length * 2);
    const bufView = new Uint16Array(buf);

    for (let i = 0, len = passphrase.length; i < len; i++) {
        bufView[i] = passphrase.charCodeAt(i);
    }

    return buf;
}

function deriveKey(passphrase, salt){
    return new Promise(resolve => {
        const baseAlgo = { name: 'PBKDF2' };

        function deriveKeyFromPhrase(){
            return window.crypto.subtle.importKey(
                'raw', passphrase, baseAlgo, false, ['deriveKey']
            );
        }

        function deriveAesKey(key){
            const algorithm = Object.assign({}, baseAlgo, {
                salt: salt, iterations: 10000, hash: { name: 'SHA-256' }
            });

            const dkType = { name: 'AES-GCM', length: 256 };
            const useage = ['encrypt', 'decrypt'];

            return window.crypto.subtle.deriveKey(
                algorithm, key, dkType, false, useage
            );
        }

        return deriveKeyFromPhrase().then(deriveAesKey).then(resolve);
    });
}
