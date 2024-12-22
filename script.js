//*====================================================*//
//*                      BANKIST APP                   *//
//*                   By: Ehenew Amogne                *//
//*                  Tikimt 24, 2016 E.C               *//
//*====================================================*//

'use strict';
////////////////////////////////////////////
////////////////////////////////////////////
// BANKIST APP
// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [ 200, 450, -400, 3000, -650, -130, 70, 1300 ],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [ 5000, 3400, -150, -790, -3210, -1000, 8500, -30 ],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [ 200, -200, 340, -300, -20, 50, 400, -460 ],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [ 430, 1000, 700, 50, 90 ],
  interestRate: 1,
  pin: 4444,
};

const accounts = [ account1, account2, account3, account4 ];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

////////////////////////////////////////////
//! ADDED
const notification = document.querySelector('.notification');
const notificationText = document.querySelector('.notification--text');
const btnCloseNotify = document.querySelector('.notify__btn--close');
const overlay = document.querySelector('.overlay');
////////////////////////////////////////////
// ?______________________________________________________________________________________________________
//* DISPLAYING MOVEMENTS
// Creating DOM Elements

const displayMovements = function (movements, sort = false) {

  // !?To avoid mutatiting of the array with the sort method, let's use slice method for movs array to have the exact copy of movements array

  // ! movs may be sorted or unsorted depending on the  value of sort
  const movs = sort ? movements
    .slice()
    .sort((a, b) => a - b) : movements;

  // getting rid of unnecessary previous data at the start
  containerMovements.innerHTML = '';
  // .textContent = ''
  // NOTE: innerHTML is a littel bit similiar to textContent,but while textContent returns the text itself HTML returns everything, including the HTML like all the HTML tags
  movs.forEach(function (mov, i, arr) {

    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${ type }">${ i + 1 }
            ${ type }</div>
          <div class="movements__date">Today</div>
          <div class="movements__value">${ mov }€</div>
        </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

/////////////////////////////////////////////
//* COMPUTING USERNAMES 

// We gonna create a side effect with out returning anything, thus forEach method is preferable
const createUsernames = function (accs) {
  accs.forEach(function (acc) {

    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[ 0 ])
      .join('');
  });
  return accs;
};
createUsernames(accounts);


/////////////////////////////////////////////
//* COMPUTONG TOTAL BALANCES 

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acm, cur) => acm + cur, 0);
  labelBalance.textContent = `${ acc.balance }€`;
};

/////////////////////////////////////////////
//* DISPLAYING SUMMARIES

const calcDisplaySummary = function (acc) {

  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acm, mov) => acm + mov, 0);
  labelSumIn.textContent = `${ incomes }€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acm, mov) => acm + mov, 0);
  labelSumOut.textContent = `${ Math.abs(out) }€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * acc.interestRate / 100)
    .filter((int, i, arr) => int >= 1)
    .reduce((acm, int) => acm + int, 0);
  labelSumInterest.textContent = `${ (interest) }€`;

};

/////////////////////////////////////////////
// Re-usable function - REFACTORING

const updateUI = function (currentAccount) {
  // Display movements
  displayMovements(currentAccount?.movements);

  // Display balance
  calcDisplayBalance(currentAccount);

  // Display summary
  calcDisplaySummary(currentAccount);
};

/////////////////////////////////////////////
/////////////////////
//!? EVENT HANDLERS
/////////////////////

//* IMPLEMENTING LOGIN

let currentAccount;
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting 
  e.preventDefault();

  currentAccount = accounts.find(acc =>
    acc.username === inputLoginUsername.value);

  // !?inputLoginPin.value always returns a string, so we have to convert into a number 
  if (currentAccount?.pin === Number(inputLoginPin.value)) {

    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${ currentAccount.owner.split(' ')[ 0 ] }`;

    containerApp.style.opacity = 1;
    labelWelcome.style.fontStyle = 'italic';
    labelWelcome.style.color = 'green';

    // Update UI
    updateUI(currentAccount);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    // removing the focus - cursor blinking
    inputLoginPin.blur();
  }
});

///////////////////////////////////////////// 
//* IMPLEMENTING TRANSFERS

btnTransfer.addEventListener('click', function (e) {
  // prevent default submitting (reloading of the page)
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const recipientAcc = accounts.find(acc =>
    acc.username === inputTransferTo.value);

  // If there is a property called balance at each accounts
  const balance = currentAccount.balance;

  // Checking if amount is positive and is less than balance of the sender and 
  if (
    amount > 0 &&
    recipientAcc &&
    balance > amount &&
    recipientAcc.username !== currentAccount.username
  ) {
    // Add negative movement to current user
    currentAccount.movements.push(-amount);

    // Add positive movement to the recipient user
    recipientAcc.movements.push(amount);

    // Update UI
    // Updating the balance, movements and summary 
    updateUI(currentAccount);

    // --------------------------------
    //! ADDED
    notification.style.opacity = 1;
    notificationText.style.color = 'inherit';
    notificationText.textContent = `You transfered ${ amount }€ to ${ recipientAcc.owner } successfully.`;
    overlay.classList.remove('hidden');

  } else {
    notification.style.opacity = 1;
    notificationText.style.color = 'red';
    notificationText.textContent = `Sorry, you have insufficient balance to transfer ${ amount }€.`;
    overlay.classList.remove('hidden');

  }
  // --------------------------------

  // remove text fields and focus
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();

});

///////////////////////////////////////////// 
//* IMPLEMENTING LOAN

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  const anyDeposits = currentAccount.movements.some(mov => mov >= amount * 0.1); // true or false

  // Check whether there is any deposit that is greater or equal to the requested loan amount
  if (amount > 0 && anyDeposits) {

    // Add positive movement to the current user
    currentAccount.movements.push(amount);

    // Update UI
    // Updating the balance, movements and summary 
    updateUI(currentAccount);

    // --------------------------------
    //! ADDED
    notification.style.opacity = 1;
    notificationText.style.color = 'inherit';
    notificationText.textContent = `You borrowed ${ amount }€ from the bank.`;
    overlay.classList.remove('hidden');
  } else {
    notification.style.opacity = 1;
    notificationText.style.color = 'red';
    notificationText.textContent = `Sorry, you are not elligible to borrow ${ amount }€ from the bank!`;
    document.querySelector('.overlay').classList.remove('hidden');

  }
  // --------------------------------

  inputLoanAmount.value = '';

});

///////////////////////////////////////////// 
//* IMPLEMENTING CLOSE ACCOUNT

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  const index = accounts.findIndex(acc => acc.username === currentAccount.username);

  // Confirm username and user pin
  if (inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin) {

    if (index !== -1) { // may not be usefull as we set opacity = 0 after closing an account
      accounts.splice(index, 1); // deletes only the intended user that is why we set the second number = 1

      // Hide UI
      containerApp.style.opacity = 0;
      // }
      // -------------------------------------
      //! ADDED
      notification.style.opacity = 1;
      notificationText.textContent = `Your request to close your account has been approved.`;
      // -------------------------------------

    }

    // Resetting the welcome text
    labelWelcome.textContent = `Log in to get started`;
    labelWelcome.style.color = '#333';
    labelWelcome.style.fontStyle = 'normal';

    // remove the focus the text fields of form buttons
    inputCloseUsername.value = inputClosePin.value = '';
    // inputClosePin.blur()
  }
});

///////////////////////////////////////////// 
//* Sorting Movements 
let sorted = false;
btnSort.addEventListener('click', function (event) {
  event.preventDefault();

  // display movements
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////
// -----------------------------------------
//! ADDED
//* CLOSE NOTIFICATION
btnCloseNotify.addEventListener('click', function () {
  notification.style.opacity = 0;
  overlay.classList.add('hidden');
});
// -----------------------------------------
// ?____________________________________________________________________________________________________________________
/////////////////////////////////////////////
/////////////////////////////////////////////
//* END OF OUR BANKIST APP *//
/////////////////////////////////////////////
/////////////////////////////////////////////