var fs = require('fs');
var Web3 = require('web3');

/* Using Infura Ethereum node */
var WalletProvider = require('truffle-hdwallet-provider-privkey');
var privKey = "--YOUR ETH WALLET PRIVATE KEY--";	////// replace this with your own key
var wallet = new WalletProvider(privKey, "https://rinkeby.infura.io/--YOUR INFURA KEY--");	////// replace this with your own key
var web3 = new Web3(wallet.engine);
var coinbase = "--YOUR ETH WALLET ADDRESS--";	////// replace this with your own address

/* Uncomment and replace with these lines if you are hosting your own Ethereum node */
//var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
//var coinbase = web3.eth.accounts[0];	////// assume that you are using the first account

console.log("Using Eth Address: " + coinbase);

var source = fs.readFileSync("build/contracts/IPFSStorage.json");
var abiDefinition = JSON.parse(source)["abi"];
var deployedAddress = JSON.parse(source)["networks"]["4"]["address"];	////// assume that you are using the Rinkeby testnet
var IPFSStorage = web3.eth.contract(abiDefinition).at(deployedAddress);
console.log("Loaded Contract deployed at: " + deployedAddress);

var ipfsAPI = require('ipfs-api');
var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'});
//var ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'});	//////	Uncomment this line if you prefer using remote IPFS node
var ipfs_timeout = 10000; //milliseconds

var bs58 = require('bs58');
var fileUpload = require('express-fileupload');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var forceSSL = require('express-force-ssl');
var http = require('http');
var https = require('https');
var request = require('request');
var async = require('async');

var clam = require('clamscan')({
    remove_infected: false,
    debug_mode: true,
    preference: 'clamscan'
});

var sgMail = require('@sendgrid/mail');
sgMail.setApiKey("--YOUR SENDGRID API KEY--");	////// replace this with your own key
sgMail.setSubstitutionWrappers('{{', '}}');

var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/public/upload/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});
var upload = multer({ storage: storage, limits: { fileSize: 500*1000*1000 } });	////// default file size limit of 500MB
var singleUpload = upload.single('data');

var secrets = require('secrets.js-grempe');
var EthCrypto = require('eth-crypto');
var NodeRSA = require('node-rsa');

var key0 = new NodeRSA();
var key1 = new NodeRSA();
var key2 = new NodeRSA();
var key3 = new NodeRSA();
var key4 = new NodeRSA();
var pub0 = new NodeRSA();
var pub1 = new NodeRSA();
var pub2 = new NodeRSA();
var pub3 = new NodeRSA();
var pub4 = new NodeRSA();

/* replace these with your own RSA keys PATH */
key0.importKey(fs.readFileSync("keys/privateKey_0.pem"));
key1.importKey(fs.readFileSync("keys/privateKey_1.pem"));
key2.importKey(fs.readFileSync("keys/privateKey_2.pem"));
key3.importKey(fs.readFileSync("keys/privateKey_3.pem"));
key4.importKey(fs.readFileSync("keys/privateKey_4.pem"));
pub0.importKey(fs.readFileSync("keys/publicKey_0.pem"));
pub1.importKey(fs.readFileSync("keys/publicKey_1.pem"));
pub2.importKey(fs.readFileSync("keys/publicKey_2.pem"));
pub3.importKey(fs.readFileSync("keys/publicKey_3.pem"));
pub4.importKey(fs.readFileSync("keys/publicKey_4.pem"));

var workers = [];
workers.push(pub0);
workers.push(pub1);
workers.push(pub2);
workers.push(pub3);
workers.push(pub4);

////// Default Shamir's Secret Sharing Scheme setting
var splitSize = 5;
var requiredShares = 3;

console.log("RSA 0-4 Key Pairs loaded.");

/* Uncomment these lines if you need to generate new RSA key pairs for Workers */
/*
key0.generateKeyPair(2048, 65537);
fs.writeFileSync("privateKey_0.pem", key0.exportKey('pkcs8-private-pem'));
fs.writeFileSync("publicKey_0.pem", key0.exportKey('pkcs8-public-pem'));
console.log("0 - RSA Key Pairs saved.");

key1.generateKeyPair(2048, 65537);
fs.writeFileSync("privateKey_1.pem", key1.exportKey('pkcs8-private-pem'));
fs.writeFileSync("publicKey_1.pem", key1.exportKey('pkcs8-public-pem'));
console.log("1 - RSA Key Pairs saved.");

key2.generateKeyPair(2048, 65537);
fs.writeFileSync("privateKey_2.pem", key2.exportKey('pkcs8-private-pem'));
fs.writeFileSync("publicKey_2.pem", key2.exportKey('pkcs8-public-pem'));
console.log("2 - RSA Key Pairs saved.");

key3.generateKeyPair(2048, 65537);
fs.writeFileSync("privateKey_3.pem", key3.exportKey('pkcs8-private-pem'));
fs.writeFileSync("publicKey_3.pem", key3.exportKey('pkcs8-public-pem'));
console.log("3 - RSA Key Pairs saved.");

key4.generateKeyPair(2048, 65537);
fs.writeFileSync("privateKey_4.pem", key4.exportKey('pkcs8-private-pem'));
fs.writeFileSync("publicKey_4.pem", key4.exportKey('pkcs8-public-pem'));
console.log("4 - RSA Key Pairs saved.");
*/

// Uncomment for local testing with self-signed SSL certificates
/*
var ssl_key = fs.readFileSync("ssl/key.pem");
var ssl_cert = fs.readFileSync("ssl/cert.pem");
var ssl_options = { key: ssl_key, cert: ssl_cert };
*/

/* replace these with your own SSL Certicate PATH */
var ssl_options = {
	key: fs.readFileSync('cert/privkey.pem'),
	cert: fs.readFileSync('cert/cert.pem'),
	ca: fs.readFileSync('cert/chain.pem')
};

var cors = require('cors');
var app = express();
app.use(forceSSL);
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(cors());

// Routes
app.get('/', function(req, res) {
	res.sendFile('index.html', { root: __dirname + '/public' });
});

app.get('/health-check', function(req, res) {
	res.sendStatus(200);
});

app.get('/login', function(req, res) {
	res.sendFile('login.html', { root: __dirname + '/public' });
});

app.get('/view', function(req, res) {
	res.sendFile('view.html', { root: __dirname + '/public' });
});

app.get('/manage', function(req, res) {
	res.sendFile('manage.html', { root: __dirname + '/public' });
});

app.get('/download', function(req, res) {
	res.sendFile('download.html', { root: __dirname + '/public' });
});

app.get('/about', function(req, res) {
	res.sendFile('about.html', { root: __dirname + '/public' });
});

app.get('/contact', function(req, res) {
	res.sendFile('contact.html', { root: __dirname + '/public' });
});

app.get('/terms', function(req, res) {
	res.sendFile('terms.html', { root: __dirname + '/public' });
});

app.get('/admin', function(req, res) {
	res.sendFile('admin.html', { root: __dirname + '/public' });
});

/// API
app.post('/api/upload/meta', function (req, res) {
	console.log(req.body);
	var fileMeta = req.body.meta
	if (fileMeta.hasOwnProperty("meta")){
		delete fileMeta["meta"];
	}
	if (fileMeta.hasOwnProperty("id")){
		delete fileMeta["id"];
	}
	if (fileMeta.hasOwnProperty("visible")){
		delete fileMeta["visible"];
	}
	if (fileMeta.hasOwnProperty("modified")){
		delete fileMeta["modified"];
	}
	if (fileMeta.hasOwnProperty("reported")){
		delete fileMeta["reported"];
	}
	if (fileMeta.hasOwnProperty("disabled")){
		delete fileMeta["disabled"];
	}
	console.log(fileMeta);
	
	var buf = Buffer.from(JSON.stringify(fileMeta));

	//upload the plain file meta
	ipfs.files.add(buf, function (err, meta_result) {
		if(err) {
			console.log(err);
			return res.sendStatus(500);
		}
		console.log(meta_result);
		res.json({ "meta_hash": meta_result[0].hash });
	});
});

app.post('/api/upload/public', singleUpload, function (req, res) {
	console.log(req.body);
	console.log(req.file);
	var currentTime = Math.floor(Date.now() / 1000);
	var username = req.body.username;
	var fileID = req.body.id;

	if (!req.file)
		return res.status(400).send('No files were uploaded.');

	//upload the plain file to IPFS
	var path = req.file.path;
	ipfs.util.addFromFs(path, { recursive: false }, function (err, result) {
		if(err) {
			console.log(err);
			return res.sendStatus(500);
		}
		console.log(result);

		var fileMeta = {
			filename: req.file.originalname,
			mimetype: req.file.mimetype,
			size: req.file.size,
			timestamp: currentTime,
			owner: username,
			address: username,
			description: req.body.description,
			hash: result[0].hash,
			localname: req.file.filename
		};
		console.log(fileMeta);
		var buf = Buffer.from(JSON.stringify(fileMeta));

		//upload the plain file meta
		ipfs.files.add(buf, function (err, meta_result) {
			if(err) {
				console.log(err);
				return res.sendStatus(500);
			}
			console.log(meta_result);
			res.json({ "meta_hash": meta_result[0].hash, "file_hash": fileMeta.hash });

			// perform virus scan asynchronously
			clam.is_infected(req.file.path, function(err, file, is_infected) {
				if(err) {
					console.log('Error during virus scan!');
				}
				if(is_infected) {
					console.log("Virus detected in " + req.file.filename + "!!");
					// delete local file
					var localpath = req.file.path;
					fs.unlink(localpath, function(err) {
						if (err) {
							console.log("Error removing " + req.file.filename + ": " + err);
						} else {
							console.log("File removed: " + req.file.filename);
						}
					});
					
					// unpin file & meta from IPFS
					ipfs.pin.rm(fileMeta.hash, function (err, pinset1) {
						if (err) {
							console.log(err);
						}
						console.log("IPFS Unpinned File: ");
						console.log(pinset1);
						ipfs.repo.gc((err, res) => console.log("IPFS GC done."));
					});
					ipfs.pin.rm(meta_result[0].hash, function (err, pinset2) {
						if (err) {
							console.log(err);
						}
						console.log("IPFS Unpinned Meta: ");
						console.log(pinset2);
						ipfs.repo.gc((err, res) => console.log("IPFS GC done."));
					});
					
					// remove file from contract
					var confirmedEvent = IPFSStorage.confirmFileIndexID({id: fileID}, function(err, ev_result) {
						if (err) {
							console.log(err);
						} else {
							var index = ev_result.args.index.toLocaleString();
							confirmedEvent.stopWatching(function(err, result){
								if (err){
									console.log('Event watcher failed to stop.');
								}
							});
							IPFSStorage.deleteFile( index, fileID, [], {from: coinbase, gas: 500000 }, function(err, tx_hash){
								if (err){
									console.log('deleteFile transaction failed.');
								} else {
									console.log('File ID: ' + fileID + ' removed. Tx Hash: ' + tx_hash);
								}
							});
						}
					});
				} else {
					console.log("Virus scan passed: " + req.file.filename);
				}
			});
		});
	});
});

app.post('/api/upload/private', singleUpload, function (req, res) {
	console.log(req.body);
	console.log(req.file);
	
	var currentTime = Math.floor(Date.now() / 1000);
	var recipient_all = [];
	var recipient_email = [];
	var recipient_addr = [];
	var username = req.body.username;
	var filePassphrase = req.body.passphrase;

	var tempList = req.body.address;
	//console.log(tempList);
	if (tempList){
		for (var i = 0; i < tempList.length; i++){
			if (isValidAddress(tempList[i]) && !recipient_addr.includes(tempList[i]) ){
				recipient_addr.push(tempList[i]);
				recipient_all.push(tempList[i]);
			} else if (isValidEmail(tempList[i]) && !recipient_email.includes(tempList[i]) ){
				recipient_email.push(tempList[i]);
				recipient_all.push(tempList[i]);
			}
		}
	}
	if (recipient_email.length > 0){
		recipient_addr.push(coinbase);
	}
	console.log(recipient_all);
	console.log(recipient_email);
	console.log(recipient_addr);

	if (!req.file)
		return res.status(400).send('No files were uploaded.');

	//upload the encrypted file to IPFS
	var path = req.file.path;
	ipfs.util.addFromFs(path, { recursive: false }, function (err, result) {
		if(err) {
			console.log(err);
			return res.sendStatus(500);
		}
		console.log(result);

		var fileMeta = {
			filename: req.body.name,
			mimetype: req.body.type,
			size: req.body.size,
			timestamp: currentTime,
			owner: username,
			address: username,
			recipients: recipient_all,
			description: req.body.description,
			hash: result[0].hash,
			localname: req.file.filename,
			passphrase: filePassphrase
		};
		console.log(fileMeta);
		var buf = Buffer.from(JSON.stringify(fileMeta));

		//upload the plain file meta
		ipfs.files.add(buf, function (err, meta_result) {
			if(err) {
				console.log(err);
				return res.sendStatus(500);
			}
			console.log(meta_result);
			res.json({ "meta_hash": meta_result[0].hash, "file_hash": fileMeta.hash, "address": recipient_addr, "email": recipient_email });
		});
	});
});

app.get('/api/ipfs/cat/:hash', function (req, res) {
	var hash = req.params.hash;
	var cat_success = false;
	
	ipfs.files.cat( hash, function (err, file) {
		cat_success = true;
		if (err) {
			console.log(err);
			return res.sendStatus(500);
		}
		var result = JSON.parse(file.toString());
		console.log(result);
		res.json(result);
	});
	setTimeout(function(){
		if (!cat_success){
			console.log("IPFS Cat Timed out: " + hash);
			return res.status(500).send('IPFS timed out.');
		}
	}, ipfs_timeout * 3);
});

app.post('/api/ipfs/add', function (req, res) {
	//console.log(req.body);
	var buf = Buffer.from(JSON.parse(JSON.stringify(req.body.encrypted)).data);
	console.log(buf);
	ipfs.files.add(buf, function (err, result) {
		if(err) {
			console.log(err);
			return res.sendStatus(500);
		}
		console.log(result);
		res.json({ "hash": ipfsHashToBytes32(result[0].hash) });
	});
});

app.post('/api/ipfs/delete', function (req, res) {
	console.log(req.body);
	var fileID = req.body.id;
	var signature = req.body.signature;
	var localname = req.body.localname;
	var meta = req.body.meta;
	var hash = req.body.hash;

	if (signature !== undefined && signature !== null){
		signer = EthCrypto.recover(signature, web3.sha3("ProjectD3"));
		console.log('Request sent by: ' + signer);
		if (!isValidAddress(signer)){
			return res.status(400).send('Invalid signer address.');
		}
		
		// get and store the 3 shares
		IPFSStorage.getFileShares(fileID, signer, {from: coinbase, gas: 500000 }, function(err, data){
			if (err){
				console.log('getFileShares failed.');
				res.sendStatus(500);
			} else {
				console.log(data);
				var dataShares = data;
				var confirmedEvent = IPFSStorage.confirmFileDeletion({id: fileID}, function(err, ev_result) {
					if (err) {
						console.log(err);
					} else {
						console.log("[Event] File ID deleted: " + fileID);
						confirmedEvent.stopWatching(function(err, result){
							if (err){
								console.log('Event watcher failed to stop.');
							}
						});
						// delete file shares
						dataShares.forEach(function(item){
							ipfs.pin.rm(bytes32ToIPFSHash(item), function (err, pinset) {
								if (err) {
									console.log(err);
								}
								console.log("IPFS Unpinned File Share: ");
								console.log(pinset);
							});
						});

						//delete localfile from server
						var localpath = __dirname + "/public/upload/" + localname;
						fs.unlink(localpath, function(err) {
							if (err) {
								console.log("Error removing " + localname + ": " + err);
							} else {
								console.log("File removed: " + localname);
							}
						});

						// unpin file & meta from IPFS
						ipfs.pin.rm(hash, function (err, pinset1) {
							if (err) {
								console.log(err);
							}
							console.log("IPFS Unpinned File: ");
							console.log(pinset1);
							ipfs.repo.gc((err, res) => console.log("IPFS GC done."));
						});
						ipfs.pin.rm(meta, function (err, pinset2) {
							if (err) {
								console.log(err);
							}
							console.log("IPFS Unpinned Meta: ");
							console.log(pinset2);
							ipfs.repo.gc((err, res) => console.log("IPFS GC done."));
						});
					}
				});
				res.sendStatus(200);
			}
		});

	} else {
		return res.status(400).send('Invalid signature.');
	}
});

app.post('/api/email/public', function (req, res) {
	console.log(req.body);
	var fileID = req.body.id;
	var useremail = req.body.useremail;
	var filename = req.body.filename;
	var filesize = req.body.filesize;
	var filetype = req.body.filetype;
	var filedesc = req.body.filedesc;
	var hash = req.body.hash;

	var confirmedEvent = IPFSStorage.confirmFileIndexID({id: fileID}, function(err, ev_result) {
		if (err) {
			console.log(err);
		} else {
			var index = ev_result.args.index.toLocaleString();
			console.log("[Event] New File indexed: " + index);
			confirmedEvent.stopWatching(function(err, result){
				if (err){
					console.log('Event watcher failed to stop.');
				}
			});
			// email to sender
			if (isValidEmail(useremail)){
				sgMail.send( senderEmail(useremail, fileID, filename, filesize, filetype, filedesc, hash, ''), (error, result) => {
					if (error) {
						console.log('sgMail send error.');
					} else {
						console.log('Confirmation mail sent to sender.');
					}
				});
			}
		}
	});
	res.sendStatus(200);
});

app.post('/api/email/private', function (req, res) {
	console.log(req.body);
	var fileID = req.body.id;
	var username = req.body.username;
	var useremail = req.body.useremail;
	var filename = req.body.filename;
	var filesize = req.body.filesize;
	var filetype = req.body.filetype;
	var filedesc = req.body.filedesc;
	var hash = req.body.hash;
	var pw = req.body.passphrase;

	var recipient_email = [];
	var tempList = req.body.address;
	//console.log(tempList);
	if (tempList){
		for (var i = 0; i < tempList.length; i++){
			if (isValidEmail(tempList[i]) && !recipient_email.includes(tempList[i]) ){
				recipient_email.push(tempList[i]);
			}
		}
	}
	console.log(recipient_email);

	var confirmedEvent = IPFSStorage.confirmFileIndexID({id: fileID}, function(err, ev_result) {
		if (err) {
			console.log(err);
		} else {
			var index = ev_result.args.index.toLocaleString();
			console.log("[Event] New File indexed: " + index);
			confirmedEvent.stopWatching(function(err, result){
				if (err){
					console.log('Event watcher failed to stop.');
				}
			});
			// email to sender
			if (isValidEmail(useremail)){
				sgMail.send( senderEmail(useremail, fileID, filename, filesize, filetype, filedesc, hash, pw), (error, result) => {
					if (error) {
						console.log('sgMail send error.');
					} else {
						console.log('Confirmation mail sent to sender.');
					}
				});
			}

			// email to recipients
			sgMail.sendMultiple( receiverEmail(username, useremail, recipient_email, fileID, filename, filesize, filetype, filedesc), (error, result) => {
				if (error) {
					console.log('sgMail send error.');
				} else {
					console.log('Mail sent to receivers.');
				}
			});
		}
	});
	res.sendStatus(200);
});

app.post('/api/email/add', function (req, res) {
	console.log(req.body);
	var fileID = req.body.id;
	var username = req.body.username;
	var useremail = req.body.useremail;
	var filename = req.body.filename;
	var filesize = req.body.filesize;
	var filetype = req.body.filetype;
	var filedesc = req.body.filedesc;

	var recipient_email = req.body.address;
	console.log(recipient_email);

	// email to new recipient
	sgMail.sendMultiple( receiverEmail(username, useremail, recipient_email, fileID, filename, filesize, filetype, filedesc), (error, result) => {
		if (error) {
			console.log('sgMail send error.');
		} else {
			console.log('Mail sent to receivers.');
		}
	});
	res.sendStatus(200);
});
///////End of API

//////////////////// Uncomment for Simulated Workers
/*
app.post('/api/server0', function (req, res) {
	console.log(req.body);
	var fileID = req.body.id;
	var signature = req.body.signature;
	var signer = "0x0";

	if (signature !== undefined && signature !== null){
		signer = EthCrypto.recover(signature, web3.sha3("ProjectD3"));
		console.log('Request sent by: ' + signer);
		if (!isValidAddress(signer)){
			return res.status(400).send('Invalid signer address.');
		}
	} else {
		console.log('Request sent by Anonymous.');
	}

	IPFSStorage.getFileShares(fileID, signer, {from: coinbase, gas: 500000 }, function(err, data){
		if (err){
			console.log('getFileShares failed.');
			res.sendStatus(500);
		} else {
			console.log(data);
			if (data.length == 0){
				return res.sendStatus(500);
			} else {
				var completed = 0;
				data.forEach(function(item){
					var cat_success = false;
					ipfs.files.cat( bytes32ToIPFSHash(item), function (err, file) {
						//console.log(file);
						cat_success = true;
						if (err) {
							console.log(err);
							return res.sendStatus(500);
						}
						try {
							var result = key0.decrypt(file);
							// success, return the share
							return res.json({ share: result.toString('utf8') });
						}
						catch (err) {
							// not the correct key!
							console.log('key0 throw error..');
							completed++;
						}
						if (completed == data.length){
							return res.status(404).send('Server-0 no available share.');
						}
					});
					setTimeout(function(){
						if (!cat_success){
							console.log("IPFS Cat Timed out: " + item);
							completed++;
							if (completed == data.length){
								return res.status(500).send('IPFS timed out.');
							}
						}
					}, ipfs_timeout);
				});
			}
		}
	});
});

app.post('/api/server1', function (req, res) {
	console.log(req.body);
	var fileID = req.body.id;
	var signature = req.body.signature;
	var signer = "0x0";

	if (signature !== undefined && signature !== null){
		signer = EthCrypto.recover(signature, web3.sha3("ProjectD3"));
		console.log('Request sent by: ' + signer);
		if (!isValidAddress(signer)){
			return res.status(400).send('Invalid signer address.');
		}
	} else {
		console.log('Request sent by Anonymous.');
	}

	IPFSStorage.getFileShares(fileID, signer, {from: coinbase, gas: 500000 }, function(err, data){
		if (err){
			console.log('getFileShares failed.');
			res.sendStatus(500);
		} else {
			console.log(data);
			if (data.length == 0){
				return res.sendStatus(500);
			} else {
				var completed = 0;
				data.forEach(function(item){
					var cat_success = false;
					ipfs.files.cat( bytes32ToIPFSHash(item), function (err, file) {
						cat_success = true;
						if (err) {
							console.log(err);
							return res.sendStatus(500);
						}
						try {
							var result = key1.decrypt(file);
							// success, return the share
							return res.json({ share: result.toString('utf8') });
						}
						catch (err) {
							// not the correct key!
							console.log('key1 throw error..');
							completed++;	
						}
						if (completed == data.length){
							return res.status(404).send('Server-1 no available share.');
						}
					});
					setTimeout(function(){
						if (!cat_success){
							console.log("IPFS Cat Timed out: " + item);
							completed++;
							if (completed == data.length){
								return res.status(500).send('IPFS timed out.');
							}
						}
					}, ipfs_timeout);
				});
			}
		}
	});
});

app.post('/api/server2', function (req, res) {
	console.log(req.body);
	var fileID = req.body.id;
	var signature = req.body.signature;
	var signer = "0x0";

	if (signature !== undefined && signature !== null){
		signer = EthCrypto.recover(signature, web3.sha3("ProjectD3"));
		console.log('Request sent by: ' + signer);
		if (!isValidAddress(signer)){
			return res.status(400).send('Invalid signer address.');
		}
	} else {
		console.log('Request sent by Anonymous.');
	}

	IPFSStorage.getFileShares(fileID, signer, {from: coinbase, gas: 500000 }, function(err, data){
		if (err){
			console.log('getFileShares failed.');
			res.sendStatus(500);
		} else {
			console.log(data);
			if (data.length == 0){
				return res.sendStatus(500);
			} else {
				var completed = 0;
				data.forEach(function(item){
					var cat_success = false;
					ipfs.files.cat( bytes32ToIPFSHash(item), function (err, file) {
						cat_success = true;
						if (err) {
							console.log(err);
							return res.sendStatus(500);
						}
						try {
							var result = key2.decrypt(file);
							// success, return the share
							return res.json({ share: result.toString('utf8') });
						}
						catch (err) {
							// not the correct key!
							console.log('key2 throw error..');
							completed++;	
						}
						if (completed == data.length){
							return res.status(404).send('Server-2 no available share.');
						}
					});
					setTimeout(function(){
						if (!cat_success){
							console.log("IPFS Cat Timed out: " + item);
							completed++;
							if (completed == data.length){
								return res.status(500).send('IPFS timed out.');
							}
						}
					}, ipfs_timeout);
				});
			}
		}
	});
});

app.post('/api/server3', function (req, res) {
	console.log(req.body);
	var fileID = req.body.id;
	var signature = req.body.signature;
	var signer = "0x0";

	if (signature !== undefined && signature !== null){
		signer = EthCrypto.recover(signature, web3.sha3("ProjectD3"));
		console.log('Request sent by: ' + signer);
		if (!isValidAddress(signer)){
			return res.status(400).send('Invalid signer address.');
		}
	} else {
		console.log('Request sent by Anonymous.');
	}

	IPFSStorage.getFileShares(fileID, signer, {from: coinbase, gas: 500000 }, function(err, data){
		if (err){
			console.log('getFileShares failed.');
			res.sendStatus(500);
		} else {
			console.log(data);
			if (data.length == 0){
				return res.sendStatus(500);
			} else {
				var completed = 0;
				data.forEach(function(item){
					var cat_success = false;
					ipfs.files.cat( bytes32ToIPFSHash(item), function (err, file) {
						cat_success = true;
						if (err) {
							console.log(err);
							return res.sendStatus(500);
						}
						try {
							var result = key3.decrypt(file);
							// success, return the share
							return res.json({ share: result.toString('utf8') });
						}
						catch (err) {
							// not the correct key!
							console.log('key3 throw error..');	
							completed++;
						}
						if (completed == data.length){
							return res.status(404).send('Server-3 no available share.');
						}
					});
					setTimeout(function(){
						if (!cat_success){
							console.log("IPFS Cat Timed out: " + item);
							completed++;
							if (completed == data.length){
								return res.status(500).send('IPFS timed out.');
							}
						}
					}, ipfs_timeout);
				});
			}
		}
	});
});

app.post('/api/server4', function (req, res) {
	console.log(req.body);
	var fileID = req.body.id;
	var signature = req.body.signature;
	var signer = "0x0";

	if (signature !== undefined && signature !== null){
		signer = EthCrypto.recover(signature, web3.sha3("ProjectD3"));
		console.log('Request sent by: ' + signer);
		if (!isValidAddress(signer)){
			return res.status(400).send('Invalid signer address.');
		}
	} else {
		console.log('Request sent by Anonymous.');
	}

	IPFSStorage.getFileShares(fileID, signer, {from: coinbase, gas: 500000 }, function(err, data){
		if (err){
			console.log('getFileShares failed.');
			res.sendStatus(500);
		} else {
			console.log(data);
			if (data.length == 0){
				return res.sendStatus(500);
			} else {
				var completed = 0;
				data.forEach(function(item){
					var cat_success = false;
					ipfs.files.cat( bytes32ToIPFSHash(item), function (err, file) {
						cat_success = true;
						if (err) {
							console.log(err);
							return res.sendStatus(500);
						}
						try {
							var result = key4.decrypt(file);
							// success, return the share
							return res.json({ share: result.toString('utf8') });
						}
						catch (err) {
							// not the correct key!
							console.log('key4 throw error..');	
							completed++;
						}
						if (completed == data.length){
							return res.status(404).send('Server-4 no available share.');
						}
					});
					setTimeout(function(){
						if (!cat_success){
							console.log("IPFS Cat Timed out: " + item);
							completed++;
							if (completed == data.length){
								return res.status(500).send('IPFS timed out.');
							}
						}
					}, ipfs_timeout);
				});
			}
		}
	});
});
*/
//////////////////// END of Simulated Workers

////// Worker API
app.post('/proxy/worker2', function (req, res) {
	console.log(req.body);
	request({ 
		method: 'POST', 
		url: 'http://ec2-13-251-15-89.ap-southeast-1.compute.amazonaws.com/api/v1', 
		headers: {
			'content-type': 'application/x-www-form-urlencoded'
        }, 
		form: req.body
	}).pipe(res);
});

app.post('/proxy/worker3', function (req, res) {
	console.log(req.body);
	request({ 
		method: 'POST', 
		url: 'http://project-d3-worker.193b.starter-ca-central-1.openshiftapps.com/api/v1', 
		headers: {
			'content-type': 'application/x-www-form-urlencoded'
        }, 
		form: req.body
	}).pipe(res);
});

app.post('/api/v1', function (req, res) {
	console.log(req.body);
	var fileID = req.body.id;
	var signature = req.body.signature;
	var signer = "0x0";

	if (signature !== undefined && signature !== null){
		signer = EthCrypto.recover(signature, web3.sha3("ProjectD3"));
		console.log('Request sent by: ' + signer);
		if (!isValidAddress(signer)){
			return res.status(400).send('Invalid signer address.');
		}
	} else {
		console.log('Request sent by Anonymous.');
	}

	IPFSStorage.getFileShares(fileID, signer, {from: coinbase, gas: 500000 }, function(err, data){
		if (err){
			console.log('getFileShares failed.');
			res.sendStatus(500);
		} else {
			console.log(data);
			if (data.length == 0){
				return res.sendStatus(500);
			} else {
				var completed = 0;
				data.forEach(function(item){
					var cat_success = false;
					ipfs.files.cat( bytes32ToIPFSHash(item), function (err, file) {
						cat_success = true;
						if (err) {
							console.log(err);
							return res.sendStatus(500);
						}
						try {
							var result = key4.decrypt(file);
							// success, return the share
							return res.json({ share: result.toString('utf8') });
						}
						catch (err) {
							// not the correct key!
							console.log('key4 throw error..');	
							completed++;
						}
						if (completed == data.length){
							return res.status(404).send('Server-4 no available share.');
						}
					});
					setTimeout(function(){
						if (!cat_success){
							console.log("IPFS Cat Timed out: " + item);
							completed++;
							if (completed == data.length){
								return res.status(500).send('IPFS timed out.');
							}
						}
					}, ipfs_timeout);
				});
			}
		}
	});
});
////// END of Worker API

app.post('/uploadPublic', singleUpload, function(req, res) {
	console.log(req.body);
	console.log(req.file);
	
	var currentTime = Math.floor(Date.now() / 1000);
	var fileID = req.body.id;
	var username = req.body.username;
	var useremail = req.body.useremail;
        var token = req.body.token;
	var provider = req.body.tokenProvider;
	var visible = true;
	if (req.body.visible == 'false' || req.body.visible == false){
		visible = false;
	}

	if (!req.file)
		return res.status(400).send('No files were uploaded.');

	if (token != 'null' && token != 'undefined'){
		validateToken(provider, token).then(function (profile) {
			console.log("Authenticated as: " + profile.email);
			
			//upload the plain file to IPFS
			var path = req.file.path;
			ipfs.util.addFromFs(path, { recursive: false }, function (err, result) {
				if(err) {
					console.log(err);
					return res.sendStatus(500);
				}
				console.log(result);

				var fileMeta = {
					filename: req.file.originalname,
					mimetype: req.file.mimetype,
					size: req.file.size,
					timestamp: currentTime,
					owner: profile.email,
					address: coinbase,
					description: req.body.description,
					hash: result[0].hash,
					localname: req.file.filename
				};
				console.log(fileMeta);
				var buf = Buffer.from(JSON.stringify(fileMeta));

				//upload the plain file meta
				ipfs.files.add(buf, function (err, meta_result) {
					if(err) {
						console.log(err);
						return res.sendStatus(500);
					}
					console.log(meta_result);
					var meta_hash = meta_result[0].hash;

					// randomly choose worker
					var chosen_workers = getRandom(workers, splitSize);
					for (var i =0; i < splitSize; i++){
						console.log(workers.indexOf(chosen_workers[i]));
					}
					//console.log(chosen_workers);

					// split and encrypt
					var metaHex = secrets.str2hex(meta_hash);
					var shares = secrets.share(metaHex, splitSize, requiredShares);
					console.log(shares);

					var encrypted_shares = [];
					for (var i =0; i <splitSize; i++){
						encrypted_shares[i] = chosen_workers[i].encrypt(shares[i]);
					}
					console.log(encrypted_shares);

					// place all encrypted shares to IPFS
					var shares_hash = [];
					async.each(encrypted_shares, function(encrypted_share, callback){
						
						ipfs.files.add(encrypted_share, function (err, result) {
							if(err) {
								console.log(err);
								callback();
							} else {
								shares_hash.push( ipfsHashToBytes32(result[0].hash) );
								callback();
							}
						});

					}, function(err){
						console.log(shares_hash);
						var addr = [];
						addr.push(coinbase);
						console.log(addr);

						IPFSStorage.addFile( fileID, visible, shares_hash, addr, {from: coinbase, gas: 500000 }, function(err, tx_hash){
							if (err){
								return res.sendStatus(500);
							} else {
								res.json({ "tx_hash": tx_hash, "file_hash": fileMeta.hash });

								// send confirmation emails
								var confirmedEvent = IPFSStorage.confirmFileIndexID({id: fileID}, function(err, ev_result) {
									if (err) {
										console.log(err);
									} else {
										var index = ev_result.args.index.toLocaleString();
										console.log("[Event] New File indexed: " + index);
										confirmedEvent.stopWatching(function(err, result){
											if (err){
												console.log('Event watcher failed to stop.');
											}
										});

										// perform virus scan
										clam.is_infected(req.file.path, function(err, file, is_infected) {
											if(err) {
												console.log('Error during virus scan!');
											}
											if(is_infected) {
												console.log("Virus detected in " + req.file.filename + "!!");
												// delete local file
												var localpath = req.file.path;
												fs.unlink(localpath, function(err) {
													if (err) {
														console.log("Error removing " + req.file.filename + ": " + err);
													} else {
														console.log("File removed: " + req.file.filename);
													}
												});
												
												// unpin file & meta from IPFS
												ipfs.pin.rm(fileMeta.hash, function (err, pinset1) {
													if (err) {
														console.log(err);
													}
													console.log("IPFS Unpinned File: ");
													console.log(pinset1);
													ipfs.repo.gc((err, res) => console.log("IPFS GC done."));
												});
												ipfs.pin.rm(meta_hash, function (err, pinset2) {
													if (err) {
														console.log(err);
													}
													console.log("IPFS Unpinned Meta: ");
													console.log(pinset2);
													ipfs.repo.gc((err, res) => console.log("IPFS GC done."));
												});
												
												// remove file from contract
												IPFSStorage.deleteFile( index, fileID, addr, {from: coinbase, gas: 500000 }, function(err, tx_hash){
													if (err){
														console.log('deleteFile transaction failed.');
													} else {
														console.log('File ID: ' + fileID + ' removed. Tx Hash: ' + tx_hash);
													}
												});

											} else {
												console.log("Virus scan passed: " + req.file.filename);
											}
										}); // END virus scan

										// email to sender
										if (isValidEmail(profile.email)){
											sgMail.send( senderEmail(profile.email, fileID, fileMeta.filename, fileMeta.size, fileMeta.mimetype, fileMeta.description, fileMeta.hash, ''), (error, result) => {
												if (error) {
													console.log('sgMail send error.');
												} else {
													console.log('Confirmation mail sent to sender.');
												}
											});
										}
									}
								});
							}
						}); // END addFile
					}); // END async
				});
			});

		}).catch(function (err) {
			console.log("Token validation failed: " + err.message );
			res.status(400).send('Token validation failed.');
		});
	} else {
		console.log("Anonymous user upload.");
		//upload the plain file to IPFS
		var path = req.file.path;
		ipfs.util.addFromFs(path, { recursive: false }, function (err, result) {
			if(err) {
				console.log(err);
				return res.sendStatus(500);
			}
			console.log(result);

			var fileMeta = {
				filename: req.file.originalname,
				mimetype: req.file.mimetype,
				size: req.file.size,
				timestamp: currentTime,
				owner: '',
				address: coinbase,
				description: req.body.description,
				hash: result[0].hash,
				localname: req.file.filename
			};
			console.log(fileMeta);
			var buf = Buffer.from(JSON.stringify(fileMeta));

			//upload the plain file meta
			ipfs.files.add(buf, function (err, meta_result) {
				if(err) {
					console.log(err);
					return res.sendStatus(500);
				}
				console.log(meta_result);
				var meta_hash = meta_result[0].hash;

				// randomly choose worker
				var chosen_workers = getRandom(workers, splitSize);
				for (var i =0; i < splitSize; i++){
					console.log(workers.indexOf(chosen_workers[i]));
				}
				//console.log(chosen_workers);

				// split and encrypt
				var metaHex = secrets.str2hex(meta_hash);
				var shares = secrets.share(metaHex, splitSize, requiredShares);
				console.log(shares);

				var encrypted_shares = [];
				for (var i =0; i <splitSize; i++){
					encrypted_shares[i] = chosen_workers[i].encrypt(shares[i]);
				}
				console.log(encrypted_shares);

				// place all encrypted shares to IPFS
				var shares_hash = [];
				async.each(encrypted_shares, function(encrypted_share, callback){
					
					ipfs.files.add(encrypted_share, function (err, result) {
						if(err) {
							console.log(err);
							callback();
						} else {
							shares_hash.push( ipfsHashToBytes32(result[0].hash) );
							callback();
						}
					});

				}, function(err){
					console.log(shares_hash);
					var addr = [];
					addr.push(coinbase);
					console.log(addr);

					IPFSStorage.addFile( fileID, visible, shares_hash, addr, {from: coinbase, gas: 500000 }, function(err, tx_hash){
						if (err){
							return res.sendStatus(500);
						} else {
							res.json({ "tx_hash": tx_hash, "file_hash": fileMeta.hash });

							var confirmedEvent = IPFSStorage.confirmFileIndexID({id: fileID}, function(err, ev_result) {
								if (err) {
									console.log(err);
								} else {
									var index = ev_result.args.index.toLocaleString();
									console.log("[Event] New File indexed: " + index);
									confirmedEvent.stopWatching(function(err, result){
										if (err){
											console.log('Event watcher failed to stop.');
										}
									});

									// perform virus scan
									clam.is_infected(req.file.path, function(err, file, is_infected) {
										if(err) {
											console.log('Error during virus scan!');
										}
										if(is_infected) {
											console.log("Virus detected in " + req.file.filename + "!!");
											// delete local file
											var localpath = req.file.path;
											fs.unlink(localpath, function(err) {
												if (err) {
													console.log("Error removing " + req.file.filename + ": " + err);
												} else {
													console.log("File removed: " + req.file.filename);
												}
											});
											
											// unpin file & meta from IPFS
											ipfs.pin.rm(fileMeta.hash, function (err, pinset1) {
												if (err) {
													console.log(err);
												}
												console.log("IPFS Unpinned File: ");
												console.log(pinset1);
												ipfs.repo.gc((err, res) => console.log("IPFS GC done."));
											});
											ipfs.pin.rm(meta_hash, function (err, pinset2) {
												if (err) {
													console.log(err);
												}
												console.log("IPFS Unpinned Meta: ");
												console.log(pinset2);
												ipfs.repo.gc((err, res) => console.log("IPFS GC done."));
											});
											
											// remove file from contract
											IPFSStorage.deleteFile( index, fileID, addr, {from: coinbase, gas: 500000 }, function(err, tx_hash){
												if (err){
													console.log('deleteFile transaction failed.');
												} else {
													console.log('File ID: ' + fileID + ' removed. Tx Hash: ' + tx_hash);
												}
											});

										} else {
											console.log("Virus scan passed: " + req.file.filename);
										}
									}); // END virus scan
									// email to sender
									if (isValidEmail(useremail)){
										sgMail.send( senderEmail(useremail, fileID, fileMeta.filename, fileMeta.size, fileMeta.mimetype, fileMeta.description, fileMeta.hash, ''), (error, result) => {
											if (error) {
												console.log('sgMail send error.');
											} else {
												console.log('Confirmation mail sent to sender.');
											}
										});
									}
								}
							});
						}
					}); // END addFile
				}); // END async
			});
		});
	}
});

app.post('/uploadEncrypt', singleUpload, function (req, res) {
	console.log(req.body);
	console.log(req.file);
	
	var currentTime = Math.floor(Date.now() / 1000);
	var fileID = req.body.id;
        var token = req.body.token;
	var provider = req.body.tokenProvider;
	var recipient_all = [];
	var recipient_email = [];
	var recipient_addr = [coinbase];
	var username = req.body.username;
	var useremail = req.body.useremail;
	var filePassphrase = req.body.passphrase;

	var tempList = req.body.address;
	//console.log(tempList);
	if (tempList){
		for (var i = 0; i < tempList.length; i++){
			if (isValidAddress(tempList[i]) && !recipient_addr.includes(tempList[i]) ){
				recipient_addr.push(tempList[i]);
				recipient_all.push(tempList[i]);
			} else if (isValidEmail(tempList[i]) && !recipient_email.includes(tempList[i]) ){
				recipient_email.push(tempList[i]);
				recipient_all.push(tempList[i]);
			}
		}
	}
	console.log(recipient_all);
	console.log(recipient_email);
	console.log(recipient_addr);

	if (!req.file)
		return res.status(400).send('No files were uploaded.');

	if (token != 'null' && token != 'undefined'){
		validateToken(provider, token).then(function (profile) {
			console.log("Authenticated as: " + profile.email);
			
			//upload the plain file to IPFS
			var path = req.file.path;
			ipfs.util.addFromFs(path, { recursive: false }, function (err, result) {
				if(err) {
					console.log(err);
					return res.sendStatus(500);
				}
				console.log(result);

				var fileMeta = {
					filename: req.body.name,
					mimetype: req.body.type,
					size: req.body.size,
					timestamp: currentTime,
					owner: profile.email,
					address: coinbase,
					recipients: recipient_all,
					description: req.body.description,
					hash: result[0].hash,
					localname: req.file.filename,
					passphrase: filePassphrase
				};
				console.log(fileMeta);
				var buf = Buffer.from(JSON.stringify(fileMeta));

				//upload the plain file meta
				ipfs.files.add(buf, function (err, meta_result) {
					if(err) {
						console.log(err);
						return res.sendStatus(500);
					}
					console.log(meta_result);
					var meta_hash = meta_result[0].hash;

					// randomly choose worker
					var chosen_workers = getRandom(workers, splitSize);
					for (var i =0; i < splitSize; i++){
						console.log(workers.indexOf(chosen_workers[i]));
					}
					//console.log(chosen_workers);

					// split and encrypt
					var metaHex = secrets.str2hex(meta_hash);
					var shares = secrets.share(metaHex, splitSize, requiredShares);
					console.log(shares);

					var encrypted_shares = [];
					for (var i =0; i <splitSize; i++){
						encrypted_shares[i] = chosen_workers[i].encrypt(shares[i]);
					}
					console.log(encrypted_shares);

					// place all encrypted shares to IPFS
					var shares_hash = [];
					async.each(encrypted_shares, function(encrypted_share, callback){
						
						ipfs.files.add(encrypted_share, function (err, result) {
							if(err) {
								console.log(err);
								callback();
							} else {
								shares_hash.push( ipfsHashToBytes32(result[0].hash) );
								callback();
							}
						});

					}, function(err){
						console.log(shares_hash);

						IPFSStorage.addFile( fileID, false, shares_hash, recipient_addr, {from: coinbase, gas: 500000 }, function(err, tx_hash){
							if (err){
								return res.sendStatus(500);
							} else {
								res.json({ "tx_hash": tx_hash, "file_hash": fileMeta.hash });

								// send confirmation emails
								var confirmedEvent = IPFSStorage.confirmFileIndexID({id: fileID}, function(err, ev_result) {
									if (err) {
										console.log(err);
									} else {
										var index = ev_result.args.index.toLocaleString();
										console.log("[Event] New File indexed: " + index);
										confirmedEvent.stopWatching(function(err, result){
											if (err){
												console.log('Event watcher failed to stop.');
											}
										});
										// email to sender
										if (isValidEmail(profile.email)){
											sgMail.send( senderEmail(profile.email, fileID, fileMeta.filename, fileMeta.size, fileMeta.mimetype, fileMeta.description, fileMeta.hash, fileMeta.passphrase), (error, result) => {
												if (error) {
													console.log('sgMail send error.');
												} else {
													console.log('Confirmation mail sent to sender.');
												}
											});
										}

										// email to recipients
										sgMail.sendMultiple( receiverEmail(username, profile.email, recipient_email, fileID, fileMeta.filename, fileMeta.size, fileMeta.mimetype, fileMeta.description), (error, result) => {
											if (error) {
												console.log('sgMail send error.');
											} else {
												console.log('Mail sent to receivers.');
											}
										});
									}
								});
							}
						}); // END addFile
					}); // END async
				});
			});

		}).catch(function (err) {
			console.log("Token validation failed: " + err.message );
			res.status(400).send('Token validation failed.');
		});
	} else {
		console.log("Anonymous user upload.");
		//upload the plain file to IPFS
		var path = req.file.path;
		ipfs.util.addFromFs(path, { recursive: false }, function (err, result) {
			if(err) {
				console.log(err);
				return res.sendStatus(500);
			}
			console.log(result);

			var fileMeta = {
				filename: req.body.name,
				mimetype: req.body.type,
				size: req.body.size,
				timestamp: currentTime,
				owner: '',
				address: coinbase,
				recipients: recipient_all,
				description: req.body.description,
				hash: result[0].hash,
				localname: req.file.filename,
				passphrase: filePassphrase
			};
			console.log(fileMeta);
			var buf = Buffer.from(JSON.stringify(fileMeta));

			//upload the plain file meta
			ipfs.files.add(buf, function (err, meta_result) {
				if(err) {
					console.log(err);
					return res.sendStatus(500);
				}
				console.log(meta_result);
				var meta_hash = meta_result[0].hash;

				// randomly choose worker
				var chosen_workers = getRandom(workers, splitSize);
				for (var i =0; i < splitSize; i++){
					console.log(workers.indexOf(chosen_workers[i]));
				}
				//console.log(chosen_workers);

				// split and encrypt
				var metaHex = secrets.str2hex(meta_hash);
				var shares = secrets.share(metaHex, splitSize, requiredShares);
				console.log(shares);

				var encrypted_shares = [];
				for (var i =0; i <splitSize; i++){
					encrypted_shares[i] = chosen_workers[i].encrypt(shares[i]);
				}
				console.log(encrypted_shares);

				// place all encrypted shares to IPFS
				var shares_hash = [];
				async.each(encrypted_shares, function(encrypted_share, callback){
					
					ipfs.files.add(encrypted_share, function (err, result) {
						if(err) {
							console.log(err);
							callback();
						} else {
							shares_hash.push( ipfsHashToBytes32(result[0].hash) );
							callback();
						}
					});

				}, function(err){
					console.log(shares_hash);
					var addr = [];
					addr.push(coinbase);
					console.log(addr);

					IPFSStorage.addFile( fileID, false, shares_hash, recipient_addr, {from: coinbase, gas: 500000 }, function(err, tx_hash){
						if (err){
							return res.sendStatus(500);
						} else {
							res.json({ "tx_hash": tx_hash, "file_hash": fileMeta.hash });

							var confirmedEvent = IPFSStorage.confirmFileIndexID({id: fileID}, function(err, ev_result) {
								if (err) {
									console.log(err);
								} else {
									var index = ev_result.args.index.toLocaleString();
									console.log("[Event] New File indexed: " + index);
									confirmedEvent.stopWatching(function(err, result){
										if (err){
											console.log('Event watcher failed to stop.');
										}
									});
									// email to sender
									if (isValidEmail(useremail)){
										sgMail.send( senderEmail(useremail, fileID, fileMeta.filename, fileMeta.size, fileMeta.mimetype, fileMeta.description, fileMeta.hash, fileMeta.passphrase), (error, result) => {
											if (error) {
												console.log('sgMail send error.');
											} else {
												console.log('Confirmation mail sent to sender.');
											}
										});
									}

									// email to recipients
									sgMail.sendMultiple( receiverEmail(null, useremail, recipient_email, fileID, fileMeta.filename, fileMeta.size, fileMeta.mimetype, fileMeta.description), (error, result) => {
										if (error) {
											console.log('sgMail send error.');
										} else {
											console.log('Mail sent to receivers.');
										}
									});
								}
							});
						}
					}); // END addFile
				}); // END async
			});
		});
	}
});

app.get('/getFileList', function(req, res) {

	IPFSStorage.getFileCount({from: coinbase, gas: 500000 }, function(err, data){
		if (err){
			console.log('getFileCount failed.');
			res.sendStatus(500);
		} else {
			var total = data.toLocaleString();
			console.log(total);
			if (total == 0){
				res.contentType('application/json');
				res.send(JSON.stringify([]));
			}
			var IDList = [];
			var numCompletedCalls = 0;

			for (var index = 0; index < total; index++) {
				IPFSStorage.getFileID(index, {from: coinbase, gas: 500000 }, function(err, data){
					console.log(data);
					if (isValidByte32(data)){
						IDList.push(data.toLocaleString());
					}
					numCompletedCalls++;

					if (numCompletedCalls == total){
						console.log("Available Public Files: " + IDList.length);
						console.log(IDList);
						var resultList = [];

						async.each(IDList, function(fileID, callback){

							// get back the shares and try decrypt
							IPFSStorage.getFileShares(fileID, "0x0", {from: coinbase, gas: 500000 }, function(err, data){
								if (err){
									console.log('getFileShares failed.');
									callback();
								} else {
									console.log(data);
									if (data.length == 0){
										callback();
									} else {
										var completed = 0;
										var shares = [];
										async.each(data, function(item, inner){
											var cat_success = false;
											ipfs.files.cat( bytes32ToIPFSHash(item), function (err, file) {
												//console.log(file);
												cat_success = true;
												if (err) {
													console.log(err);
													inner();
												} else {
													try {
														var result0 = key0.decrypt(file);
														shares.push(result0.toString('utf8'));
													} catch (err) {
														console.log('key0 throw error..');
													}
													try {
														var result1 = key1.decrypt(file);
														shares.push(result1.toString('utf8'));
													} catch (err) {
														console.log('key1 throw error..');
													}
													try {
														var result2 = key2.decrypt(file);
														shares.push(result2.toString('utf8'));
													} catch (err) {
														console.log('key2 throw error..');
													}
													try {
														var result3 = key3.decrypt(file);
														shares.push(result3.toString('utf8'));
													} catch (err) {
														console.log('key3 throw error..');
													}
													try {
														var result4 = key4.decrypt(file);
														shares.push(result4.toString('utf8'));
													} catch (err) {
														console.log('key4 throw error..');
													}
													inner();
												}
											});
											setTimeout(function(){
												if (!cat_success){
													console.log("IPFS Cat Timed out: " + item);
													inner();
												}
											}, ipfs_timeout);
										}, function(err){
											console.log(shares);
											// combine to retrieve the original meta hash
											var meta_hash = secrets.hex2str(secrets.combine(shares));
											console.log(meta_hash);
											var cat_success = false;
											ipfs.files.cat( meta_hash, function (err, file) {
												cat_success = true;
												if (err) {
													console.log(err);
													callback();
												} else {
													var result = JSON.parse(file.toString());
													IPFSStorage.getFile(fileID, {from: coinbase, gas: 500000 }, function(err, data){
														if (err){
															console.log(err);
															callback();
														} else {
															result["id"] = data[0];
															result["address"] = data[1];
															result["modified"] = data[2].toLocaleString();
															result["reported"] = data[3].toLocaleString();
															resultList.push(result);
															callback();
														}
													});
												}
											});
											setTimeout(function(){
												if (!cat_success){
													console.log("IPFS Cat Timed out: " + hash);
													callback();
												}
											}, ipfs_timeout * 3);
										}); // END inner async
									}
								}
							}); // END getFileShares

						}, function(err){
							res.contentType('application/json');
							res.send(JSON.stringify(resultList));
						}); // END async
					}
				});
			}
		}
	});
});

app.post('/getOwnFileList', function(req, res) {
	console.log(req.body);

	var token = req.body.token;
	var provider = req.body.tokenProvider;
	var result = [];
	if (token != 'null' && token != 'undefined'){
		validateToken(provider, token).then(function (profile) {
			console.log("Authenticated as: " + profile.email);

			IPFSStorage.getFileCount({from: coinbase, gas: 500000 }, function(err, data){
				if (err){
					console.log('getFileCount failed.');
					res.sendStatus(500);
				} else {
					var total = data.toLocaleString();
					console.log(total);
					if (total == 0){
						res.contentType('application/json');
						res.send(JSON.stringify([]));
					}
					var IDList = [];
					var numCompletedCalls = 0;

					for (var index = 0; index < total; index++) {
						IPFSStorage.getFileID(index, {from: coinbase, gas: 500000 }, function(err, data){
							console.log(data);
							if (isValidByte32(data)){
								IDList.push(data.toLocaleString());
							}
							numCompletedCalls++;

							if (numCompletedCalls == total){
								console.log(IDList);
								var publicResultList = [];
								var privateResultList = [];

								async.each(IDList, function(fileID, callback){

									IPFSStorage.getOwnFile(fileID, {from: coinbase, gas: 500000 }, function(err, file_data){
										if (err){
											console.log(err);
											callback();
										} else {
											console.log(file_data);
											// check if valid
											if (isValidByte32(file_data[0])){
												// get back the shares and try decrypt
												IPFSStorage.getFileShares(fileID, coinbase, {from: coinbase, gas: 500000 }, function(err, data){
													if (err){
														console.log('getFileShares failed.');
														callback();
													} else {
														console.log(data);
														if (data.length == 0){
															callback();
														} else {
															var completed = 0;
															var shares = [];
															async.each(data, function(item, inner){
																var cat_success = false;
																ipfs.files.cat( bytes32ToIPFSHash(item), function (err, file) {
																	//console.log(file);
																	cat_success = true;
																	if (err) {
																		console.log(err);
																		inner();
																	} else {
																		try {
																			var result0 = key0.decrypt(file);
																			shares.push(result0.toString('utf8'));
																		} catch (err) {
																			console.log('key0 throw error..');
																		}
																		try {
																			var result1 = key1.decrypt(file);
																			shares.push(result1.toString('utf8'));
																		} catch (err) {
																			console.log('key1 throw error..');
																		}
																		try {
																			var result2 = key2.decrypt(file);
																			shares.push(result2.toString('utf8'));
																		} catch (err) {
																			console.log('key2 throw error..');
																		}
																		try {
																			var result3 = key3.decrypt(file);
																			shares.push(result3.toString('utf8'));
																		} catch (err) {
																			console.log('key3 throw error..');
																		}
																		try {
																			var result4 = key4.decrypt(file);
																			shares.push(result4.toString('utf8'));
																		} catch (err) {
																			console.log('key4 throw error..');
																		}
																		inner();
																	}
																});
																setTimeout(function(){
																	if (!cat_success){
																		console.log("IPFS Cat Timed out: " + item);
																		inner();
																	}
																}, ipfs_timeout);
															}, function(err){
																console.log(shares);
																// combine to retrieve the original meta hash
																var meta_hash = secrets.hex2str(secrets.combine(shares));
																console.log(meta_hash);
																var cat_success = false;
																ipfs.files.cat( meta_hash, function (err, file) {
																	cat_success = true;
																	if (err) {
																		console.log(err);
																		callback();
																	} else {
																		var result = JSON.parse(file.toString());
																		if (result["owner"] == profile.email){
																			result["meta"] = meta_hash;
																			result["id"] = file_data[0];
																			result["visible"] = file_data[1];
																			result["modified"] = file_data[2].toLocaleString();
																			result["reported"] = file_data[3].toLocaleString();
																			if (result.hasOwnProperty("passphrase")){
																				privateResultList.push(result);
																			} else {
																				publicResultList.push(result);
																			}
																		}
																		callback();
																	}
																});
																setTimeout(function(){
																	if (!cat_success){
																		console.log("IPFS Cat Timed out: " + hash);
																		callback();
																	}
																}, ipfs_timeout * 3);
															}); // END inner async
														}
													}
												}); // END getFileShares

											} else {
												callback();
											}
										}
									}); // END getOwnFile
								}, function(err){
									res.contentType('application/json');
									var finalList = [];
									finalList.push(publicResultList);
									finalList.push(privateResultList);
									res.send(JSON.stringify(finalList));
								}); // END async
							}
						});
					}
				}
			});

		}).catch(function (err) {
			console.log("Token validation failed: " + err.message );
			res.contentType('application/json');
			res.send(JSON.stringify(result));
		});
	} else {
		res.contentType('application/json');
		res.send(JSON.stringify(result));
	}
});

app.post('/getFileMeta', function(req, res) {
	console.log(req.body);
	var fileID = req.body.id;
	var token = req.body.token;
	var provider = req.body.tokenProvider;

	if (token != 'null' && token != 'undefined'){
		validateToken(provider, token).then(function (profile) {
			console.log("Authenticated as: " + profile.email);

			// get back the shares and try decrypt
			IPFSStorage.getFileShares(fileID, coinbase, {from: coinbase, gas: 500000 }, function(err, data){
				if (err){
					console.log('getFileShares failed.');
					return res.sendStatus(500);
				} else {
					console.log(data);
					if (data.length == 0){
						return res.sendStatus(500);
					} else {
						var completed = 0;
						var shares = [];
						async.each(data, function(item, inner){
							var cat_success = false;
							ipfs.files.cat( bytes32ToIPFSHash(item), function (err, file) {
								//console.log(file);
								cat_success = true;
								if (err) {
									console.log(err);
									inner();
								} else {
									try {
										var result0 = key0.decrypt(file);
										shares.push(result0.toString('utf8'));
									} catch (err) {
										console.log('key0 throw error..');
									}
									try {
										var result1 = key1.decrypt(file);
										shares.push(result1.toString('utf8'));
									} catch (err) {
										console.log('key1 throw error..');
									}
									try {
										var result2 = key2.decrypt(file);
										shares.push(result2.toString('utf8'));
									} catch (err) {
										console.log('key2 throw error..');
									}
									try {
										var result3 = key3.decrypt(file);
										shares.push(result3.toString('utf8'));
									} catch (err) {
										console.log('key3 throw error..');
									}
									try {
										var result4 = key4.decrypt(file);
										shares.push(result4.toString('utf8'));
									} catch (err) {
										console.log('key4 throw error..');
									}
									inner();
								}
							});
							setTimeout(function(){
								if (!cat_success){
									console.log("IPFS Cat Timed out: " + item);
									inner();
								}
							}, ipfs_timeout);
						}, function(err){
							console.log(shares);
							// combine to retrieve the original meta hash
							var meta_hash = secrets.hex2str(secrets.combine(shares));
							console.log(meta_hash);
							var cat_success = false;
							ipfs.files.cat( meta_hash, function (err, file) {
								cat_success = true;
								if (err) {
									console.log(err);
									return res.sendStatus(500);
								} else {
									var result = JSON.parse(file.toString());
									if (result.hasOwnProperty("passphrase")){
										if (result["owner"] == profile.email || result["recipients"].indexOf(profile.email) > -1){
											return res.json(result);
										} else {
											return res.sendStatus(500);
										}
									} else {
										return res.json(result);
									}
								}
							});
							setTimeout(function(){
								if (!cat_success){
									console.log("IPFS Cat Timed out: " + hash);
									return res.sendStatus(500);
								}
							}, ipfs_timeout * 3);
						}); // END inner async
					}
				}
			}); // END getFileShares

		}).catch(function (err) {
			console.log("Token validation failed: " + err.message );
			res.status(400).send('Token validation failed.');
		});
	} else {
		res.status(400).send('Token not found.');
	}
});

app.post('/setFileVisble', function(req, res) {
	console.log(req.body);
	var fileID = req.body.id;
	var value = req.body.value;
	var token = req.body.token;
	var provider = req.body.tokenProvider;

	if (token != 'null' && token != 'undefined'){
		validateToken(provider, token).then(function (profile) {
			console.log("Authenticated as: " + profile.email);

			// get back the shares and try decrypt
			IPFSStorage.getFileShares(fileID, coinbase, {from: coinbase, gas: 500000 }, function(err, data){
				if (err){
					console.log('getFileShares failed.');
					return res.sendStatus(500);
				} else {
					console.log(data);
					if (data.length == 0){
						return res.sendStatus(500);
					} else {
						var completed = 0;
						var shares = [];
						async.each(data, function(item, inner){
							var cat_success = false;
							ipfs.files.cat( bytes32ToIPFSHash(item), function (err, file) {
								//console.log(file);
								cat_success = true;
								if (err) {
									console.log(err);
									inner();
								} else {
									try {
										var result0 = key0.decrypt(file);
										shares.push(result0.toString('utf8'));
									} catch (err) {
										console.log('key0 throw error..');
									}
									try {
										var result1 = key1.decrypt(file);
										shares.push(result1.toString('utf8'));
									} catch (err) {
										console.log('key1 throw error..');
									}
									try {
										var result2 = key2.decrypt(file);
										shares.push(result2.toString('utf8'));
									} catch (err) {
										console.log('key2 throw error..');
									}
									try {
										var result3 = key3.decrypt(file);
										shares.push(result3.toString('utf8'));
									} catch (err) {
										console.log('key3 throw error..');
									}
									try {
										var result4 = key4.decrypt(file);
										shares.push(result4.toString('utf8'));
									} catch (err) {
										console.log('key4 throw error..');
									}
									inner();
								}
							});
							setTimeout(function(){
								if (!cat_success){
									console.log("IPFS Cat Timed out: " + item);
									inner();
								}
							}, ipfs_timeout);
						}, function(err){
							console.log(shares);
							// combine to retrieve the original meta hash
							var meta_hash = secrets.hex2str(secrets.combine(shares));
							console.log(meta_hash);
							var cat_success = false;
							ipfs.files.cat( meta_hash, function (err, file) {
								cat_success = true;
								if (err) {
									console.log(err);
									return res.sendStatus(500);
								} else {
									var result = JSON.parse(file.toString());
									if (result["owner"] == profile.email){
										IPFSStorage.setVisible( fileID, value, {from: coinbase, gas: 500000 }, function(err, tx_hash){
											if (err){
												console.log('Transaction failed.');
												return res.sendStatus(500);
											} else {
												res.json({ "tx_hash": tx_hash });
											}
										});
									} else {
										res.status(400).send('Permission denied.');
									}
								}
							});
							setTimeout(function(){
								if (!cat_success){
									console.log("IPFS Cat Timed out: " + hash);
									return res.sendStatus(500);
								}
							}, ipfs_timeout * 3);
						}); // END inner async
					}
				}
			}); // END getFileShares
		}).catch(function (err) {
			console.log("Token validation failed: " + err.message );
			res.status(400).send('Token validation failed.');
		});
	} else {
		res.status(400).send('Token not found.');
	}
});

app.post('/deleteFile', function(req, res) {
	console.log(req.body);
	var fileID = req.body.id;
	var token = req.body.token;
	var provider = req.body.tokenProvider;

	if (token != 'null' && token != 'undefined'){
		validateToken(provider, token).then(function (profile) {
			console.log("Authenticated as: " + profile.email);
			
			// get back the shares and try decrypt
			IPFSStorage.getFileShares(fileID, coinbase, {from: coinbase, gas: 500000 }, function(err, data){
				if (err){
					console.log('getFileShares failed.');
					return res.sendStatus(500);
				} else {
					console.log(data);
					var dataShares = data;
					if (data.length == 0){
						return res.sendStatus(500);
					} else {
						var completed = 0;
						var shares = [];
						async.each(data, function(item, inner){
							var cat_success = false;
							ipfs.files.cat( bytes32ToIPFSHash(item), function (err, file) {
								//console.log(file);
								cat_success = true;
								if (err) {
									console.log(err);
									inner();
								} else {
									try {
										var result0 = key0.decrypt(file);
										shares.push(result0.toString('utf8'));
									} catch (err) {
										console.log('key0 throw error..');
									}
									try {
										var result1 = key1.decrypt(file);
										shares.push(result1.toString('utf8'));
									} catch (err) {
										console.log('key1 throw error..');
									}
									try {
										var result2 = key2.decrypt(file);
										shares.push(result2.toString('utf8'));
									} catch (err) {
										console.log('key2 throw error..');
									}
									try {
										var result3 = key3.decrypt(file);
										shares.push(result3.toString('utf8'));
									} catch (err) {
										console.log('key3 throw error..');
									}
									try {
										var result4 = key4.decrypt(file);
										shares.push(result4.toString('utf8'));
									} catch (err) {
										console.log('key4 throw error..');
									}
									inner();
								}
							});
							setTimeout(function(){
								if (!cat_success){
									console.log("IPFS Cat Timed out: " + item);
									inner();
								}
							}, ipfs_timeout);
						}, function(err){
							console.log(shares);
							// combine to retrieve the original meta hash
							var meta_hash = secrets.hex2str(secrets.combine(shares));
							console.log(meta_hash);
							var cat_success = false;
							ipfs.files.cat( meta_hash, function (err, file) {
								cat_success = true;
								if (err) {
									console.log(err);
									return res.sendStatus(500);
								} else {
									var result = JSON.parse(file.toString());
									if (result["owner"] == profile.email){
										// find the index from logs
										var pastEvent = IPFSStorage.confirmFileIndexID({id: fileID}, {fromBlock: 0, toBlock: 'latest'});
										pastEvent.get( function(err, ev_result) {
											if (err) {
												console.log(err);
												return res.sendStatus(500);
											} else {
												console.log(ev_result);
												var index = ev_result[ev_result.length-1].args.index.toLocaleString();
												pastEvent.stopWatching(function(err, result){
													if (err){
														console.log('Event watcher failed to stop.');
													}
												});
												console.log(index);
												if (!result.hasOwnProperty("recipients")){
													var temp = [];
													temp.push(coinbase);
													result["recipients"] = temp;
												} else {
													result.recipients.push(coinbase);
												}
												console.log(result.recipients);
												var recipient_addr = [];
												for (var i = 0; i < result.recipients.length; i++){
													if (isValidAddress(result.recipients[i]) && !recipient_addr.includes(result.recipients[i]) ){
														recipient_addr.push(result.recipients[i]);
													}
												}
												console.log(recipient_addr);
												IPFSStorage.deleteFile( index, fileID, recipient_addr, {from: coinbase, gas: 500000 }, function(err, tx_hash){
													if (err){
														console.log(err);
														return res.sendStatus(500);
													} else {
														res.json({ "tx_hash": tx_hash });
													}
												});

												// delete file shares
												dataShares.forEach(function(item){
													ipfs.pin.rm(bytes32ToIPFSHash(item), function (err, pinset) {
														if (err) {
															console.log(err);
														}
														console.log("IPFS Unpinned File Share: ");
														console.log(pinset);
													});
												});

												//delete localfile from server
												var localpath = __dirname + "/public/upload/" + result["localname"];
												fs.unlink(localpath, function(err) {
													if (err) {
														console.log("Error removing " + result["localname"] + ": " + err);
													} else {
														console.log("File removed: " + result["localname"]);
													}
												});

												// unpin file & meta from IPFS
												ipfs.pin.rm(result["hash"], function (err, pinset1) {
													if (err) {
														console.log(err);
													}
													console.log("IPFS Unpinned File: ");
													console.log(pinset1);
													ipfs.repo.gc((err, res) => console.log("IPFS GC done."));
												});
												ipfs.pin.rm(meta_hash, function (err, pinset2) {
													if (err) {
														console.log(err);
													}
													console.log("IPFS Unpinned Meta: ");
													console.log(pinset2);
													ipfs.repo.gc((err, res) => console.log("IPFS GC done."));
												});
											}
										});
									} else {
										res.status(400).send('Permission denied.');
									}
								}
							});
							setTimeout(function(){
								if (!cat_success){
									console.log("IPFS Cat Timed out: " + hash);
									return res.sendStatus(500);
								}
							}, ipfs_timeout * 3);
						}); // END inner async
					}
				}
			}); // END getFileShares

		}).catch(function (err) {
			console.log("Token validation failed: " + err.message );
			return res.status(400).send('Token validation failed.');
		});
	} else {
		return res.status(400).send('Token not found.');
	}
});

app.post('/removeRecipient', function(req, res) {
	console.log(req.body);
	var fileID = req.body.id;
	var address = req.body.address;
	var token = req.body.token;
	var provider = req.body.tokenProvider;

	if (!isValidAddress(address) && !isValidEmail(address)){
		res.status(400).send('Invalid recipient.');
	}

	if (token != 'null' && token != 'undefined'){
		validateToken(provider, token).then(function (profile) {
			console.log("Authenticated as: " + profile.email);
			
			// get back the shares and try decrypt
			IPFSStorage.getFileShares(fileID, coinbase, {from: coinbase, gas: 500000 }, function(err, data){
				if (err){
					console.log('getFileShares failed.');
					return res.sendStatus(500);
				} else {
					console.log(data);
					var dataShares = data;
					if (data.length == 0){
						return res.sendStatus(500);
					} else {
						var completed = 0;
						var shares = [];
						async.each(data, function(item, inner){
							var cat_success = false;
							ipfs.files.cat( bytes32ToIPFSHash(item), function (err, file) {
								//console.log(file);
								cat_success = true;
								if (err) {
									console.log(err);
									inner();
								} else {
									try {
										var result0 = key0.decrypt(file);
										shares.push(result0.toString('utf8'));
									} catch (err) {
										console.log('key0 throw error..');
									}
									try {
										var result1 = key1.decrypt(file);
										shares.push(result1.toString('utf8'));
									} catch (err) {
										console.log('key1 throw error..');
									}
									try {
										var result2 = key2.decrypt(file);
										shares.push(result2.toString('utf8'));
									} catch (err) {
										console.log('key2 throw error..');
									}
									try {
										var result3 = key3.decrypt(file);
										shares.push(result3.toString('utf8'));
									} catch (err) {
										console.log('key3 throw error..');
									}
									try {
										var result4 = key4.decrypt(file);
										shares.push(result4.toString('utf8'));
									} catch (err) {
										console.log('key4 throw error..');
									}
									inner();
								}
							});
							setTimeout(function(){
								if (!cat_success){
									console.log("IPFS Cat Timed out: " + item);
									inner();
								}
							}, ipfs_timeout);
						}, function(err){
							console.log(shares);
							// combine to retrieve the original meta hash
							var meta_hash = secrets.hex2str(secrets.combine(shares));
							console.log(meta_hash);
							var cat_success = false;
							ipfs.files.cat( meta_hash, function (err, file) {
								cat_success = true;
								if (err) {
									console.log(err);
									return res.sendStatus(500);
								} else {
									var result = JSON.parse(file.toString());
									if (result["owner"] == profile.email){
										// create and upload new meta
										var targetIndex = result.recipients.indexOf(address);
										if (targetIndex > -1) {
										    result.recipients.splice(targetIndex, 1);
										}
										console.log(result);

										var addrList = [];
										if (isValidAddress(address)){
											addrList.push(address);
										}
										console.log(addrList);
										var buf = Buffer.from(JSON.stringify(result));
										console.log(buf);

										ipfs.files.add(buf, function (err, meta_result) {
											if(err) {
												console.log(err);
												return res.sendStatus(500);
											}
											console.log(meta_result);
											var meta_hash = meta_result[0].hash;

											// randomly choose worker
											var chosen_workers = getRandom(workers, splitSize);
											for (var i =0; i < splitSize; i++){
												console.log(workers.indexOf(chosen_workers[i]));
											}
											//console.log(chosen_workers);

											// split and encrypt
											var metaHex = secrets.str2hex(meta_hash);
											var shares = secrets.share(metaHex, splitSize, requiredShares);
											console.log(shares);

											var encrypted_shares = [];
											for (var i =0; i <splitSize; i++){
												encrypted_shares[i] = chosen_workers[i].encrypt(shares[i]);
											}
											console.log(encrypted_shares);

											// place all encrypted shares to IPFS
											var shares_hash = [];
											async.each(encrypted_shares, function(encrypted_share, callback){
												
												ipfs.files.add(encrypted_share, function (err, result) {
													if(err) {
														console.log(err);
														callback();
													} else {
														shares_hash.push( ipfsHashToBytes32(result[0].hash) );
														callback();
													}
												});

											}, function(err){
												console.log(shares_hash);
												IPFSStorage.setRecipients( fileID, shares_hash, addrList, false, {from: coinbase, gas: 500000 }, function(err, tx_hash){
													if (err){
														return res.sendStatus(500);
													} else {
														res.json({ "tx_hash": tx_hash });
													}
												}); // END setRecipients
											}); // END async
										});
										
									} else {
										res.status(400).send('Permission denied.');
									}
								}
							});
							setTimeout(function(){
								if (!cat_success){
									console.log("IPFS Cat Timed out: " + hash);
									return res.sendStatus(500);
								}
							}, ipfs_timeout * 3);
						}); // END inner async
					}
				}
			}); // END getFileShares

		}).catch(function (err) {
			console.log("Token validation failed: " + err.message );
			res.status(400).send('Token validation failed.');
		});
	} else {
		res.status(400).send('Token not found.');
	}
});

app.post('/addRecipient', function(req, res) {
	console.log(req.body);
	var fileID = req.body.id;
	var address = req.body.address;
	var username = req.body.username;
	var token = req.body.token;
	var provider = req.body.tokenProvider;

	if (!isValidAddress(address) && !isValidEmail(address)){
		res.status(400).send('Invalid recipient.');
	}

	if (token != 'null' && token != 'undefined'){
		validateToken(provider, token).then(function (profile) {
			console.log("Authenticated as: " + profile.email);
			// get back the shares and try decrypt
			IPFSStorage.getFileShares(fileID, coinbase, {from: coinbase, gas: 500000 }, function(err, data){
				if (err){
					console.log('getFileShares failed.');
					return res.sendStatus(500);
				} else {
					console.log(data);
					var dataShares = data;
					if (data.length == 0){
						return res.sendStatus(500);
					} else {
						var completed = 0;
						var shares = [];
						async.each(data, function(item, inner){
							var cat_success = false;
							ipfs.files.cat( bytes32ToIPFSHash(item), function (err, file) {
								//console.log(file);
								cat_success = true;
								if (err) {
									console.log(err);
									inner();
								} else {
									try {
										var result0 = key0.decrypt(file);
										shares.push(result0.toString('utf8'));
									} catch (err) {
										console.log('key0 throw error..');
									}
									try {
										var result1 = key1.decrypt(file);
										shares.push(result1.toString('utf8'));
									} catch (err) {
										console.log('key1 throw error..');
									}
									try {
										var result2 = key2.decrypt(file);
										shares.push(result2.toString('utf8'));
									} catch (err) {
										console.log('key2 throw error..');
									}
									try {
										var result3 = key3.decrypt(file);
										shares.push(result3.toString('utf8'));
									} catch (err) {
										console.log('key3 throw error..');
									}
									try {
										var result4 = key4.decrypt(file);
										shares.push(result4.toString('utf8'));
									} catch (err) {
										console.log('key4 throw error..');
									}
									inner();
								}
							});
							setTimeout(function(){
								if (!cat_success){
									console.log("IPFS Cat Timed out: " + item);
									inner();
								}
							}, ipfs_timeout);
						}, function(err){
							console.log(shares);
							// combine to retrieve the original meta hash
							var meta_hash = secrets.hex2str(secrets.combine(shares));
							console.log(meta_hash);
							var cat_success = false;
							ipfs.files.cat( meta_hash, function (err, file) {
								cat_success = true;
								if (err) {
									console.log(err);
									return res.sendStatus(500);
								} else {
									var result = JSON.parse(file.toString());
									var fileMeta = result;
									if (result["owner"] == profile.email){
										// create and upload new meta
										result.recipients.push(address);
										console.log(result);

										var addrList = [];
										if (isValidAddress(address)){
											addrList.push(address);
										} else {
											addrList.push(coinbase);
										}
										console.log(addrList);
										var buf = Buffer.from(JSON.stringify(result));
										console.log(buf);

										ipfs.files.add(buf, function (err, meta_result) {
											if(err) {
												console.log(err);
												return res.sendStatus(500);
											}
											console.log(meta_result);
											var meta_hash = meta_result[0].hash;

											// randomly choose worker
											var chosen_workers = getRandom(workers, splitSize);
											for (var i =0; i < splitSize; i++){
												console.log(workers.indexOf(chosen_workers[i]));
											}
											//console.log(chosen_workers);

											// split and encrypt
											var metaHex = secrets.str2hex(meta_hash);
											var shares = secrets.share(metaHex, splitSize, requiredShares);
											console.log(shares);

											var encrypted_shares = [];
											for (var i =0; i <splitSize; i++){
												encrypted_shares[i] = chosen_workers[i].encrypt(shares[i]);
											}
											console.log(encrypted_shares);

											// place all encrypted shares to IPFS
											var shares_hash = [];
											async.each(encrypted_shares, function(encrypted_share, callback){
												
												ipfs.files.add(encrypted_share, function (err, result) {
													if(err) {
														console.log(err);
														callback();
													} else {
														shares_hash.push( ipfsHashToBytes32(result[0].hash) );
														callback();
													}
												});

											}, function(err){
												console.log(shares_hash);
												IPFSStorage.setRecipients( fileID, shares_hash, addrList, true, {from: coinbase, gas: 500000 }, function(err, tx_hash){
													if (err){
														return res.sendStatus(500);
													} else {
														// email to new recipient
														if (isValidEmail(address)){
															sgMail.sendMultiple( receiverEmail(username, profile.email, address, fileID, fileMeta.filename, fileMeta.size, fileMeta.mimetype, fileMeta.description), (error, result) => {
																if (error) {
																	console.log('sgMail send error.');
																} else {
																	console.log('Mail sent to new receiver.');
																}
															});
														}
														res.json({ "tx_hash": tx_hash });
													}
												}); // END setRecipients
											}); // END async
										});
										
									} else {
										res.status(400).send('Permission denied.');
									}
								}
							});
							setTimeout(function(){
								if (!cat_success){
									console.log("IPFS Cat Timed out: " + hash);
									return res.sendStatus(500);
								}
							}, ipfs_timeout * 3);
						}); // END inner async
					}
				}
			}); // END getFileShares
			
		}).catch(function (err) {
			console.log("Token validation failed: " + err.message );
			res.status(400).send('Token validation failed.');
		});
	} else {
		res.status(400).send('Token not found.');
	}
});

app.post('/sendFeedback', function(req, res) {
	console.log(req.body);
	var name = req.body.name;
	var email = req.body.email;
	var message = req.body.message;
	
	var content = {
		to: 'u3518122@connect.hku.hk',
		from: 'no-reply@project-d3.xyz',
		subject: 'D3 Feedback Form',
		html: '<p> Name: ' + name + '</p><p> Email: ' + email + '</p><p> Message: ' + message +'</p>'
	};
	sgMail.send(content, (error, result) => {
		if (error) {
			return res.status(500).send('Oops! Your message cannot be sent due to server error..');
		} else {
			return res.sendStatus(200);
		}
	});
});

// return raw file for public files
app.get('/download/:id', function(req, res) {
	var fileID = req.params.id;

	// get back the shares and try decrypt
	IPFSStorage.getFileShares(fileID, "0x0", {from: coinbase, gas: 500000 }, function(err, data){
		if (err){
			console.log('getFileShares failed.');
			return res.sendStatus(500);
		} else {
			console.log(data);
			if (data.length == 0){
				return res.sendStatus(500);
			} else {
				var completed = 0;
				var shares = [];
				async.each(data, function(item, inner){
					var cat_success = false;
					ipfs.files.cat( bytes32ToIPFSHash(item), function (err, file) {
						//console.log(file);
						cat_success = true;
						if (err) {
							console.log(err);
							inner();
						} else {
							try {
								var result0 = key0.decrypt(file);
								shares.push(result0.toString('utf8'));
							} catch (err) {
								console.log('key0 throw error..');
							}
							try {
								var result1 = key1.decrypt(file);
								shares.push(result1.toString('utf8'));
							} catch (err) {
								console.log('key1 throw error..');
							}
							try {
								var result2 = key2.decrypt(file);
								shares.push(result2.toString('utf8'));
							} catch (err) {
								console.log('key2 throw error..');
							}
							try {
								var result3 = key3.decrypt(file);
								shares.push(result3.toString('utf8'));
							} catch (err) {
								console.log('key3 throw error..');
							}
							try {
								var result4 = key4.decrypt(file);
								shares.push(result4.toString('utf8'));
							} catch (err) {
								console.log('key4 throw error..');
							}
							inner();
						}
					});
					setTimeout(function(){
						if (!cat_success){
							console.log("IPFS Cat Timed out: " + item);
							inner();
						}
					}, ipfs_timeout);
				}, function(err){
					console.log(shares);
					// combine to retrieve the original meta hash
					var meta_hash = secrets.hex2str(secrets.combine(shares));
					console.log(meta_hash);
					var cat_success = false;
					ipfs.files.cat( meta_hash, function (err, file) {
						cat_success = true;
						if (err) {
							console.log(err);
							return res.sendStatus(500);
						} else {
							var result = JSON.parse(file.toString());
							var hash = result.hash;
							var get_success = false;
							console.log(hash);
							ipfs.files.get(hash, function (err, files) {
								get_success = true;
								if(err) {
									console.log(err);
									return res.sendStatus(500);
							      	}
								res.setHeader('Content-Type', result.mimetype);
		  						res.setHeader('Content-Disposition', 'attachment; filename=' + result.filename);
							  	files.forEach((file) => {
									res.write(file.content, 'binary');
								})
								res.end(null, 'binary');
							});
							setTimeout(function(){
								if (!get_success){
									console.log("IPFS Get Timed out: " + result.hash);
									return res.status(500).send('IPFS timed out.');
								}
							}, ipfs_timeout * 20);
						}
					});
					setTimeout(function(){
						if (!cat_success){
							console.log("IPFS Cat Timed out: " + meta_hash);
							return res.sendStatus(500);
						}
					}, ipfs_timeout * 3);
				}); // END inner async
			}
		}
	}); // END getFileShares
}); 

// equivalent to ipfs gateway
app.get('/direct/:hash', function(req, res) {
	var hash = req.params.hash;
	var get_success = false;
	console.log(hash);
	ipfs.files.get(hash, function (err, files) {
		get_success = true;
		if(err) {
			console.log(err);
			return res.sendStatus(500);
	      	}
	  	files.forEach((file) => {
			res.write(file.content, 'binary');
		})
		res.end(null, 'binary');
	});
	setTimeout(function(){
		if (!get_success){
			console.log("IPFS Get Timed out: " + hash);
			return res.status(500).send('IPFS timed out.');
		}
	}, ipfs_timeout * 10);
});

app.get('/contract', function(req, res) {
	res.json({ "contract": deployedAddress, "abi": abiDefinition, "address": coinbase });
});

app.get('/getInfo', function(req, res) {
	web3.eth.getBalance(coinbase, function(err, data){
		if (err){
			console.log('getBalance failed.');
			res.sendStatus(500);
		} else {
			console.log(data); 
			var accBalance = web3.fromWei(data, 'ether').toNumber();
			res.json({ "contract": deployedAddress, "address": coinbase, "balance": accBalance });
		}
	});
});

app.get('*', function(req, res) {
	res.sendFile('error.html', { root: __dirname + '/public' });
});


// Listen
app.set('forceSSLOptions', {
	enable301Redirects: true,
	trustXFPHeader: false,
	httpsPort: 8443,
	sslRequiredMessage: 'SSL Required.'
});

var server = http.createServer(app);
var secureServer = https.createServer(ssl_options, app);
var port = 8080;
secureServer.listen(8443);
server.listen(port);
console.log('App listening on port '+ port + ', force redirecting to 8443...');

//Helper functions
function senderEmail(useremail, fileID, filename, filesize, filetype, filedesc, hash, pw){
	
	var passphrase = '( - not required - )'
	if (pw != ''){
		passphrase = pw;
	}

	var msg = {
		to: useremail,
		from: 'no-reply@project-d3.xyz',
		subject: 'You have uploaded a file via D3',
		templateId: 'fe23280f-25e1-4bee-a4ee-bcad0d9746d2',
		substitutions: {
			filename: filename,
			mimetype: filetype,
			size: humanFileSize(filesize),
			description: filedesc,
			hash: hash,
			index: toAscii(fileID),
			pw: passphrase
		}
	};
	return msg;
}

function receiverEmail(name, emailSender, emailArray, fileID, filename, filesize, filetype, filedesc){
	var sender = "Someone";
	if (name != null && name != 'null' && name !='undefined'){
		sender = name;
	}

	if (!isValidEmail(emailSender)){
		emailSender = 'no-reply@project-d3.xyz';
	}

	var msg = {
		to: emailArray,
		from: emailSender,
		subject: sender + ' sent you a file via D3',
		templateId: 'b735f92a-ea33-440d-841f-f677eeb6c8fd',
		substitutions: {
			filename: filename,
			mimetype: filetype,
			size: humanFileSize(filesize),
			description: filedesc,
			index: toAscii(fileID)
		}
	};
	return msg;
}

function validateToken(provider, token) {
	var providers = {
		facebook: {
			url: 'https://graph.facebook.com/me?fields=email'
		},
		google: {
			url: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json'
		}
	};

	return new Promise(function (resolve, reject) {
		request({
			url: providers[provider].url,
		        qs: { access_token: token }
		},
		function (error, response, body) {
		        if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body));
		        } else {
				reject(error);
		        }
		});
    	});
}

function ipfsHashToBytes32(ipfs_hash) {
	var h = bs58.decode(ipfs_hash).toString('hex').replace(/^1220/, '');
	if (h.length != 64) {
		console.log('invalid ipfs format', ipfs_hash, h);
		return null;
	}
	return '0x' + h;
}

function bytes32ToIPFSHash(hash_hex) {
	var buf = new Buffer(hash_hex.replace(/^0x/, '1220'), 'hex')
	return bs58.encode(buf)
}

function isValidByte32(data){
	return (data != '0x' && data != '0x0000000000000000000000000000000000000000000000000000000000000000');
}

function isValidAddress(str) {
	return /^0x[a-fA-F0-9]{40}$/.test(str);
}

function isValidEmail(str) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(str);
}

function getRandom(arr, n) {
	var result = new Array(n), len = arr.length, taken = new Array(len);
	if (n > len)
		throw new RangeError("getRandom: more elements taken than available");
	while (n--) {
		var x = Math.floor(Math.random() * len);
        	result[n] = arr[x in taken ? taken[x] : x];
        	taken[x] = --len in taken ? taken[len] : len;
	}
	return result;
}

// assume input always starts with 0x
function toAscii(hex){
    var str = '',
        i = 0,
        l = hex.length;
    if (hex.substring(0, 2) === '0x') {
        i = 2;
    } else {
	return hex;
    }
    for (; i < l; i+=2) {
        var code = parseInt(hex.substr(i, 2), 16);
        if (code === 0) continue; // this is added
        str += String.fromCharCode(code);
    }
    return str;
};

function humanFileSize(bytes) {
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