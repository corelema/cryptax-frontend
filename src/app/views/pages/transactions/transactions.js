import { Button, Container, Table, Header, Menu, Icon, Segment, Grid, Modal } from 'semantic-ui-react';
import { connect } from "react-redux";
import groupBy from 'lodash/groupBy';
import { Link, Redirect } from 'react-router-dom';
import PropTypes from "prop-types";
import React, { Component } from 'react';

import { TransactionModal } from 'components';
import { currenciesThunks } from 'state/ducks/currencies';
import styles from './transactions.scss';
import { transactionsThunks } from 'state/ducks/transactions';
import { withResponsiveWrapper } from 'enhancers';
import { DeleteModal } from './delete-modal/deleteModal';

export class Transactions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orderedTransactions: {},
    };
  }

  componentWillMount() {
    const {
      getCurrencies,
      currencies,
      currenciesTimestamp,
      getTransactions,
      user,
    } = this.props;

    getTransactions(user.id);

    if (!currencies.lenght) {
      getCurrencies();
    }
  };

  componentDidUpdate(prevProps) {
    const { transactions } = this.props;
    if (transactions !== prevProps.transactions) {
      this.setState({ orderedTransactions: groupBy(transactions, 'source') })
    }
  }

  addTransactionWrapper = transaction => {
    const { addTransaction, user } = this.props;

    addTransaction(user.id, transaction);
  };

  onChangeFile = event => {
    const { files } = event.target;
    const { addTransactionsFile, user } = this.props;

    Object.values(files).map(file => {
      addTransactionsFile(user.id, file, 'binance');
    });
  };

  updateTransactionWrapper = transaction => {
    const { addTransaction, user } = this.props; // update

    addTransaction(user.id, transaction);
  };

  onDelete = transaction => {
    const { deleteTransaction, user } = this.props;

    deleteTransaction(user.id, transaction.id);
  }

  render() {
    const { currencies, addTransactionStatus } = this.props;

    const { orderedTransactions } = this.state;

    return (
      <div>
        <Container className={styles.buttonsWrapper}>
          <Segment color="grey">
            <TransactionModal
              updateTransaction={this.addTransactionWrapper}
              updateTransactionStatus={addTransactionStatus}
              sourceCurrencies={currencies}
            >
              <Button icon labelPosition='left' primary size='large'>
                <Icon name='plus' /> Add Transaction Manually
              </Button>
            </TransactionModal>
            <Button
              as='label'
              floated='right'
              htmlFor='upload'
              icon
              labelPosition='left'
              primary size='large'
            >
              <Icon name='upload' /> Import Transactions
              <input
                  hidden
                  id='upload'
                  multiple
                  type="file"
                  onChange={this.onChangeFile} />
            </Button>
          </Segment>
        </Container>

        <Grid divided='vertically'>
          {Object.keys(orderedTransactions).map(exchange => (
            <Grid.Row columns={1} key={exchange}>
              <Grid.Column>
                <Container className={styles.exchange}>
                  <Header as='h1'>{exchange.toUpperCase()}</Header>
                  <Table celled color='red' sortable striped>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Date</Table.HeaderCell>
                        <Table.HeaderCell>Type</Table.HeaderCell>
                        <Table.HeaderCell>Price</Table.HeaderCell>
                        <Table.HeaderCell>Quantity</Table.HeaderCell>
                        <Table.HeaderCell>Currency 1</Table.HeaderCell>
                        <Table.HeaderCell>Currency 2</Table.HeaderCell>
                        <Table.HeaderCell />
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      {orderedTransactions[exchange].map(transaction => (
                        <Table.Row key={transaction.id}>
                          <Table.Cell>{transaction.date}</Table.Cell>
                          <Table.Cell>{transaction.type}</Table.Cell>
                          <Table.Cell>{transaction.price}</Table.Cell>
                          <Table.Cell>{transaction.quantity}</Table.Cell>
                          <Table.Cell>{transaction.currency1}</Table.Cell>
                          <Table.Cell>{transaction.currency2}</Table.Cell>
                          <Table.Cell collapsing>
                            <Button.Group size='tiny'>
                              <TransactionModal
                                updateTransaction={this.updateTransactionWrapper}
                                updateTransactionStatus={addTransactionStatus}
                                sourceCurrencies={currencies}
                                initialTransaction={transaction}
                              >
                                <Button
                                  animated='vertical'
                                  htmlFor='edit'
                                  size='mini'
                                >
                                  <Button.Content hidden>Edit</Button.Content>
                                  <Button.Content visible>
                                    <Icon name='edit' />
                                  </Button.Content>
                                </Button>
                              </TransactionModal>
                              <DeleteModal
                                deleteTransaction={() => this.onDelete(transaction)}
                              >
                                <Button
                                  animated='vertical'
                                  color='red'
                                  htmlFor='edit'
                                  size='mini'
                                >
                                  <Button.Content hidden>Delete</Button.Content>
                                  <Button.Content visible>
                                    <Icon name='delete' />
                                  </Button.Content>
                                </Button>
                              </DeleteModal>
                            </Button.Group>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </Container>
              </Grid.Column>
            </Grid.Row>
          ))}
        </Grid>
      </div>
    )
  };
};

Transactions.propTypes = {
  currencies: PropTypes.array,
  currenciesTimestamp: PropTypes.object,
  transactions: PropTypes.array,
  addTransactionStatus: PropTypes.number,
  user: PropTypes.object,

  addTransaction: PropTypes.func.isRequired,
  addTransactionsFile: PropTypes.func.isRequired,
  getCurrencies: PropTypes.func.isRequired,
  getTransactions: PropTypes.func.isRequired,
  resetAddTransactionStatus: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  currencies: state.currencies.all,
  currenciesTimestamp: state.currencies.timestamp,
  transactions: state.transactions.all,
  addTransactionStatus: state.transactions.addTransactionStatus,
  user: state.session.user,
});

const mapDispatchToProps = {
  addTransaction: transactionsThunks.addTransaction,
  addTransactionsFile: transactionsThunks.addTransactionsFile,
  deleteTransaction: transactionsThunks.deleteTransaction,
  getCurrencies: currenciesThunks.getCurrencies,
  getTransactions: transactionsThunks.getTransactions,
  resetAddTransactionStatus: transactionsThunks.resetAddTransactionStatus,
};

export default withResponsiveWrapper(connect(mapStateToProps, mapDispatchToProps)(Transactions));
