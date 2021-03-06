/* global sinon, Stripe */

import Ember from 'ember';
import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('service:stripe', 'StripeService', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

var cc = {
  number: 4242424242424242,
  exp_year: 2018,
  exp_month: 10,
  cvc: 123,
  address_zip: 12345
};

test('createToken sets the token and returns a promise', function() {
  var service = this.subject();
  var response = {
    id: 'the_token'
  };

  var createToken = sinon.stub(Stripe.card, 'createToken', function(card, cb) {
    equal(card, cc, 'called with sample creditcard');
    cb(200, response);
  });

  return service.createToken(cc)
    .then(function(res) {
      equal(res.id, 'the_token');
      createToken.restore();
    });
});

test('createToken rejects the promise if Stripe errors', function() {
  var service = this.subject();
  var response = {
    error : {
      code: "invalid_number",
      message: "The 'exp_month' parameter should be an integer (instead, is Month).",
      param: "exp_month",
      type: "card_error"
    }
  };

  var createToken = sinon.stub(Stripe.card, 'createToken', function(card, cb) {
    cb(402, response);
  });

  return service.createToken(cc)
  .then(undefined, function(res) {
    equal(res, response, 'error passed');
    createToken.restore();
  });
});

// LOG_STRIPE_SERVICE is set to true in dummy app
test('it logs when LOG_STRIPE_SERVICE is set in env config', function() {
  var service = this.subject();
  var info = sinon.stub(Ember.Logger, 'info');

  var createToken = sinon.stub(Stripe.card, 'createToken', function(card, cb) {
    var response = {
      id: 'my id'
    };
    cb(200, response);
  });

  return service.createToken(cc)
  .then(function(err) {
    ok(info.calledWith('StripeService: getStripeToken - card:', cc));
    createToken.restore();
    info.restore();
  });
});

/**
 * @todo figure out how to change env variables at runtime
 */
QUnit.skip('it logs if LOG_STRIPE_SERVICE is false');
QUnit.skip('it throws an error if config.stripe.publishableKey is not set');