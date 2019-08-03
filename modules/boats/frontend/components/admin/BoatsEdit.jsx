/* eslint-disable react/prop-types */

import React, { lazy, Component } from 'react';
import { I18n } from '@lingui/react';
import { connect } from 'react-redux';
import { remove as removeCookie } from 'es-cookie';
import UIkit from 'uikit';
import axios from 'axios';
import moment from 'moment';
import { Trans, t } from '@lingui/macro';
import { history } from '../../../../../shared/store/configureStore';
import appDataRuntimeSetToken from '../../../../../shared/actions/appDataRuntimeSetToken';
import appDataSetUser from '../../../../../shared/actions/appDataSetUser';
import config from '../../../../../etc/config.json';
import appDataRuntimeSetDocumentTitle from '../../../../../shared/actions/appDataRuntimeSetDocumentTitle';
import BoatAvailabilityDialog from './BoatAvailabilityDialog.jsx';
import BoatBlocksDialog from './BoatBlocksDialog.jsx';
import BoatPricesDialog from './BoatPricesDialog.jsx';
import BoatExtrasDialog from './BoatExtrasDialog.jsx';

const AdminPanel = lazy(() => import(/* webpackMode: "lazy", webpackChunkName: "AdminPanel" */'../../../../../shared/components/AdminPanel/AdminPanel.jsx'));
const FormBuilder = lazy(() => import(/* webpackMode: "lazy", webpackChunkName: "FormBuilder" */'../../../../../shared/components/FormBuilder/index.jsx'));

class BoatsEdit extends Component {
    constructor(props) {
        super(props);
        this.editBoatsForm = React.createRef();
        this.boatAvailabilityDialog = React.createRef();
        this.boatBlocksDialog = React.createRef();
        this.boatPricesDialog = React.createRef();
        this.boatExtrasDialog = React.createRef();
    }

    state = {
        loadingError: false
    }

    componentDidMount = () => {
        if (!this.props.appDataRuntime.token) {
            history.push('/users/auth?redirect=/admin/boats');
        }
    }

    componentDidUpdate = prevProps => {
        if (prevProps.appData.language !== this.props.appData.language) {
            moment.locale(this.props.appData.language);
        }
    }

    deauthorize = () => {
        this.props.appDataRuntimeSetTokenAction(null);
        this.props.appDataSetUserAction({});
        removeCookie(`${config.siteId}_auth`);
        history.push(`/users/auth?redirect=/admin/boats`);
    }

    onBoatsTableLoadError = data => {
        if (data && data.statusCode === 403) {
            this.deauthorize();
        }
    }

    onSaveSuccessHandler = i18n => {
        UIkit.notification({
            message: i18n._('Data has been saved successfully'),
            status: 'success'
        });
        history.push('/admin/boats?reload=1');
    }

    onAddAvailClick = i18n => {
        this.boatAvailabilityDialog.current.showDialog(i18n, null);
    }

    onEditAvailClick = (e, item, i18n) => {
        e.preventDefault();
        const data = {
            default: {
                destination: item.destination.id,
                country: item.country.id,
                bases: item.bases,
                homeBase: item.homeBase.id,
                start: item.start,
                end: item.end
            }
        };
        this.boatAvailabilityDialog.current.showDialog(i18n, item.id, data);
    }

    onDeleteAvailClick = async (e, item) => {
        e.preventDefault();
        const data = (await this.editBoatsForm.current.getValue('avail')).filter(i => i.id !== item.id);
        await this.editBoatsForm.current.setValue('avail', data);
    }

    onAddBlocksClick = i18n => {
        this.boatBlocksDialog.current.showDialog(i18n, null);
    }

    onEditBlocksClick = (e, item, i18n) => {
        e.preventDefault();
        const data = {
            default: {
                start: item.start,
                end: item.end
            }
        };
        this.boatBlocksDialog.current.showDialog(i18n, item.id, data);
    }

    onDeleteBlocksClick = async (e, item) => {
        e.preventDefault();
        const data = (await this.editBoatsForm.current.getValue('blocks')).filter(i => i.id !== item.id);
        await this.editBoatsForm.current.setValue('blocks', data);
    }

    onAddPricesClick = i18n => {
        this.boatPricesDialog.current.showDialog(i18n, null);
    }

    onEditPricesClick = (e, item, i18n) => {
        e.preventDefault();
        const data = {
            default: {
                start: item.start,
                end: item.end,
                cost: item.cost,
                currency: item.currency
            }
        };
        this.boatPricesDialog.current.showDialog(i18n, item.id, data);
    }

    onDeletePricesClick = async (e, item) => {
        e.preventDefault();
        const data = (await this.editBoatsForm.current.getValue('prices')).filter(i => i.id !== item.id);
        await this.editBoatsForm.current.setValue('prices', data);
    }

    onAddExtrasClick = i18n => {
        this.boatExtrasDialog.current.showDialog(i18n, null);
    }

    onEditExtrasClick = (e, item, i18n) => {
        e.preventDefault();
        const data = {
            default: {
                name: item.name,
                cost: item.cost,
                per1: item.per1,
                per2: item.per2,
                options: item.options
            }
        };
        this.boatExtrasDialog.current.showDialog(i18n, item.id, data);
    }

    onDeleteExtrasClick = async (e, item) => {
        e.preventDefault();
        const data = (await this.editBoatsForm.current.getValue('extras')).filter(i => i.id !== item.id);
        await this.editBoatsForm.current.setValue('extras', data);
    }

    getLocalizedString = s => {
        const [en, ru] = s.split(/\|/);
        if (this.props.appData.language === 'ru' && ru) {
            return ru;
        }
        return en;
    }

    getEditForm = i18n => (<FormBuilder
        ref={this.editBoatsForm}
        prefix="editBoatsForm"
        UIkit={UIkit}
        axios={axios}
        i18n={i18n}
        data={[
            [{
                id: 'title',
                type: 'text',
                label: `${i18n._(t`Boat title`)}:`,
                css: 'uk-form-width-large',
                autofocus: true
            },
            {
                id: 'type',
                type: 'select',
                label: `${i18n._(t`Type`)}:`,
                css: 'uk-form-width-medium',
                defaultValue: '1',
                values: {
                    1: 'Monohull',
                    2: 'Catamaran',
                    3: 'Motor Boat',
                    4: 'Powered Catamaran',
                    5: 'Gulet',
                    10: 'Launch',
                    11: 'Motor Shop',
                    12: 'Houseboat'
                },
            }],
            [
                {
                    id: 'model',
                    type: 'text',
                    label: `${i18n._(t`Model`)}:`,
                    css: 'uk-form-width-large',
                },
                {
                    id: 'byear',
                    type: 'text',
                    label: `${i18n._(t`Build Year`)}:`,
                    css: 'uk-form-width-small',
                },
                {
                    id: 'ryear',
                    type: 'text',
                    label: `${i18n._(t`Refitted Year`)}:`,
                    css: 'uk-form-width-small',
                },
                {
                    id: 'length',
                    type: 'text',
                    label: `${i18n._(t`Length`)}:`,
                    helpText: i18n._(t`Meters`),
                    css: 'uk-form-width-small',
                },
                {
                    id: 'power',
                    type: 'text',
                    label: `${i18n._(t`Power`)}:`,
                    helpText: i18n._(t`HP`),
                    css: 'uk-form-width-small',
                },
                {
                    id: 'npax',
                    type: 'text',
                    label: `${i18n._(t`Pax`)}:`,
                    css: 'uk-form-width-small',
                }
            ],
            {
                id: 'avail',
                type: 'data',
                label: `${i18n._(t`Availability`)}:`,
                css: 'uk-form-width-large',
                placeholderText: i18n._(t`Add or remove availability data`),
                buttons: (<button type="button" className="uk-button uk-button-primary uk-button-small" onClick={() => this.onAddAvailClick(i18n)}><span uk-icon="icon:plus;ratio:0.5" className="uk-margin-small-right" />{i18n._(t`Add`)}</button>),
                wrap: ({ children }) => (<ul className={`uk-list uk-list-divider${children.length ? ' uk-card uk-card-default uk-card-small uk-card-body' : ''}`}>{children}</ul>),
                view: data => (<li key={data.id}>
                    <a href="" className="uk-button uk-button-default uk-button-small uk-margin-small-right" onClick={e => this.onEditAvailClick(e, data, i18n)}>{i18n._(t`Edit`)}</a>
                    <a href="" className="uk-button uk-button-danger uk-button-small uk-margin-right" onClick={e => this.onDeleteAvailClick(e, data, i18n)}>{i18n._(t`Delete`)}</a>
                    <span className="uk-margin-small-right">{moment(data.start).format('L')} &ndash; {moment(data.end).format('L')}</span>
                    <span className="uk-margin-small-right">{data.homeBase.name}</span>
                </li>)
            },
            {
                id: 'blocks',
                type: 'data',
                label: `${i18n._(t`Blocks`)}:`,
                css: 'uk-form-width-large',
                placeholderText: i18n._(t`Add or remove blocks data`),
                buttons: (<button type="button" className="uk-button uk-button-primary uk-button-small" onClick={() => this.onAddBlocksClick(i18n)}><span uk-icon="icon:plus;ratio:0.5" className="uk-margin-small-right" />{i18n._(t`Add`)}</button>),
                wrap: ({ children }) => (<ul className={`uk-list uk-list-divider${children.length ? ' uk-card uk-card-default uk-card-small uk-card-body' : ''}`}>{children}</ul>),
                view: data => (<li key={data.id}>
                    <a href="" className="uk-button uk-button-default uk-button-small uk-margin-small-right" onClick={e => this.onEditBlocksClick(e, data, i18n)}>{i18n._(t`Edit`)}</a>
                    <a href="" className="uk-button uk-button-danger uk-button-small uk-margin-right" onClick={e => this.onDeleteBlocksClick(e, data, i18n)}>{i18n._(t`Delete`)}</a>
                    <span className="uk-margin-small-right">{moment(data.start).format('L')} &ndash; {moment(data.end).format('L')}</span>
                </li>)
            },
            [
                {
                    id: 'beam',
                    type: 'text',
                    label: `${i18n._(t`Beam`)}:`,
                    helpText: i18n._(t`Meters`),
                    css: 'uk-form-width-small',
                },
                {
                    id: 'draft',
                    type: 'text',
                    label: `${i18n._(t`Draft`)}:`,
                    helpText: i18n._(t`Meters`),
                    css: 'uk-form-width-small',
                },
                {
                    id: 'cabins',
                    type: 'text',
                    label: `${i18n._(t`Cabins`)}:`,
                    css: 'uk-form-width-small',
                },
                {
                    id: 'bathrooms',
                    type: 'text',
                    label: `${i18n._(t`Bathrooms`)}:`,
                    css: 'uk-form-width-small',
                },
                {
                    id: 'showers',
                    type: 'text',
                    label: `${i18n._(t`Showers`)}:`,
                    css: 'uk-form-width-small',
                },
                {
                    id: 'heads',
                    type: 'text',
                    label: `${i18n._(t`Heads`)}:`,
                    css: 'uk-form-width-small',
                },
                {
                    id: 'dcabins',
                    type: 'text',
                    label: `${i18n._(t`Double Cabins`)}:`,
                    css: 'uk-form-width-small',
                },
                {
                    id: 'scabins',
                    type: 'text',
                    label: `${i18n._(t`Single Cabins`)}:`,
                    css: 'uk-form-width-small',
                },
                {
                    id: 'dberth',
                    type: 'text',
                    label: `${i18n._(t`Double Berths`)}:`,
                    css: 'uk-form-width-small',
                },
            ],
            [
                {
                    id: 'caution',
                    type: 'text',
                    label: `${i18n._(t`Damage Deposit`)}:`,
                    css: 'uk-form-width-small',
                },
                {
                    id: 'discounts',
                    type: 'text',
                    label: `${i18n._(t`Discounts`)}:`,
                    helpText: i18n._(t`Format: DAYS=DISCOUNT, DAYS=DISCOUNT, ... (example: 7=5, 14=10)`),
                    css: 'uk-form-width-large',
                }
            ],
            [{
                id: 'skipperCost',
                type: 'text',
                label: `${i18n._(t`Skipper Cost`)}:`,
                css: 'uk-form-width-small',
            },
            {
                id: 'skipperPer1',
                type: 'select',
                label: `${i18n._(t`Per`)}:`,
                css: 'uk-form-width-small',
                defaultValue: 'stay',
                values: { stay: i18n._(t`stay`), day: i18n._(t`day`), week: i18n._(t`week`) },
            },
            {
                id: 'skipperPer2',
                type: 'select',
                label: `${i18n._(t`Per`)}:`,
                css: 'uk-form-width-small',
                defaultValue: 'boat',
                values: { boat: i18n._(t`boat`), pax: i18n._(t`pax`) },
            }],
            {
                id: 'prices',
                type: 'data',
                label: `${i18n._(t`Prices`)}:`,
                css: 'uk-form-width-large',
                placeholderText: i18n._(t`Add or remove prices data`),
                buttons: (<button type="button" className="uk-button uk-button-primary uk-button-small" onClick={() => this.onAddPricesClick(i18n)}><span uk-icon="icon:plus;ratio:0.5" className="uk-margin-small-right" />{i18n._(t`Add`)}</button>),
                wrap: ({ children }) => (<ul className={`uk-list uk-list-divider${children.length ? ' uk-card uk-card-default uk-card-small uk-card-body' : ''}`}>{children}</ul>),
                view: data => (<li key={data.id}>
                    <a href="" className="uk-button uk-button-default uk-button-small uk-margin-small-right" onClick={e => this.onEditPricesClick(e, data, i18n)}>{i18n._(t`Edit`)}</a>
                    <a href="" className="uk-button uk-button-danger uk-button-small uk-margin-right" onClick={e => this.onDeletePricesClick(e, data, i18n)}>{i18n._(t`Delete`)}</a>
                    <span className="uk-margin-small-right">{data.cost} {data.currency} ({moment(data.start).format('L')} &ndash; {moment(data.end).format('L')})</span>
                </li>)
            },
            {
                id: 'charsText',
                type: 'textarea',
                label: `${i18n._(t`Characteristics`)}:`,
                css: 'uk-width-1-1 uk-height-small',
            },
            {
                id: 'charsTextHelp',
                type: 'message',
                css: 'uk-text-small uk-text-muted',
                text: i18n._(t`Each line should contain a new characteristic. Start a new line with an * character to define a category, format: * NAME_EN|NAME_RU, example: "* New Category|Новая категория" (without quotes). A line without * at the beginning will be parsed as a characteristic. The format is as following: NAME_EN|NAME_RU,QUANTITY,UNIT, example: "Boat anchor|Якорь для яхты,10,meters" (without quotes).`)
            },
            {
                id: 'extras',
                type: 'data',
                label: `${i18n._(t`Extras`)}:`,
                css: 'uk-form-width-large',
                placeholderText: i18n._(t`Add or remove extras data`),
                buttons: (<button type="button" className="uk-button uk-button-primary uk-button-small" onClick={() => this.onAddExtrasClick(i18n)}><span uk-icon="icon:plus;ratio:0.5" className="uk-margin-small-right" />{i18n._(t`Add`)}</button>),
                wrap: ({ children }) => (<ul className={`uk-list uk-list-divider${children.length ? ' uk-card uk-card-default uk-card-small uk-card-body' : ''}`}>{children}</ul>),
                view: data => (<li key={data.id}>
                    <a href="" className="uk-button uk-button-default uk-button-small uk-margin-small-right" onClick={e => this.onEditExtrasClick(e, data, i18n)}>{i18n._(t`Edit`)}</a>
                    <a href="" className="uk-button uk-button-danger uk-button-small uk-margin-right" onClick={e => this.onDeleteExtrasClick(e, data, i18n)}>{i18n._(t`Delete`)}</a>
                    <span className="uk-margin-small-right">{this.getLocalizedString(data.name)}: {data.cost} {i18n._(t`per`)} {i18n._(data.per1)}, {i18n._(t`per`)} {i18n._(data.per2)} ({data.options.mand ? i18n._(t`mandatory`) : i18n._(t`optional`)})</span>
                </li>)
            },
            [
                {
                    id: 'pics',
                    type: 'file',
                    label: `${i18n._(t`Boat Photos`)}:`
                },
                {
                    id: 'plan',
                    type: 'file',
                    label: `${i18n._(t`Boat Plan`)}:`
                }
            ],
            {
                id: 'divider1',
                type: 'divider'
            },
            [
                {
                    id: 'btnCancel',
                    type: 'button',
                    buttonType: 'link',
                    linkTo: '/admin/boats',
                    css: 'uk-button-default uk-margin-small-right',
                    label: i18n._(t`Cancel`)
                }, {
                    id: 'btnSave',
                    type: 'button',
                    buttonType: 'submit',
                    css: 'uk-button-primary',
                    label: i18n._(t`Save`)
                }
            ]
        ]}
        validation={
            {
                title: {
                    mandatory: true,
                    maxLength: 64
                },
                type: {
                    mandatory: true
                },
                model: {
                    mandatory: true,
                    maxLength: 64
                },
                byear: {
                    mandatory: true,
                    regexp: /^[\d]{4}$/
                },
                ryear: {
                    regexp: /^[\d]{4}$/
                },
                length: {
                    mandatory: true,
                    regexp: /^\d+(\.\d+)?$/
                },
                power: {
                    mandatory: true,
                    regexp: /^\d+(\.\d+)?$/
                },
                npax: {
                    mandatory: true,
                    regexp: /^[\d]+$/
                },
                beam: {
                    mandatory: true,
                    regexp: /^\d+(\.\d+)?$/
                },
                draft: {
                    mandatory: true,
                    regexp: /^\d+(\.\d+)?$/
                },
                cabins: {
                    mandatory: true,
                    regexp: /^[\d]+$/
                },
                bathrooms: {
                    regexp: /^[\d]+$/
                },
                showers: {
                    regexp: /^[\d]+$/
                },
                heads: {
                    regexp: /^[\d]+$/
                },
                dcabins: {
                    regexp: /^[\d]+$/
                },
                scabins: {
                    regexp: /^[\d]+$/
                },
                dberth: {
                    regexp: /^[\d]+$/
                },
                caution: {
                    regexp: /^\d+(\.\d+)?$/
                },
                skipperCost: {
                    regexp: /^\d+(\.\d+)?$/
                },
                chars: {
                    maxLength: 8192
                }
            }
        }
        lang={{
            ERR_VMANDATORY: i18n._(t`Field is required`),
            ERR_VFORMAT: i18n._(t`Invalid format`),
            ERR_VNOMATCH: i18n._(`Passwords do not match`),
            ERR_LOAD: i18n._(t`Could not load data from server`),
            ERR_SAVE: i18n._(t`Could not save data`),
            WILL_BE_DELETED: i18n._(t`will be deleted. Are you sure?`),
            YES: i18n._(t`Yes`),
            CANCEL: i18n._(t`Cancel`)
        }}
        save={{
            url: `${config.apiURL}/api/boats/save`,
            method: 'POST',
            extras: {
                id: this.props.match.params.id,
                token: this.props.appDataRuntime.token
            }
        }}
        load={this.props.match.params.id ? {
            url: `${config.apiURL}/api/boats/load`,
            method: 'POST',
            extras: {
                id: this.props.match.params.id,
                token: this.props.appDataRuntime.token
            }
        } : null}
        onSaveSuccess={() => this.onSaveSuccessHandler(i18n)}
        onLoadError={() => this.setState({ loadingError: true })}
        onLoadSuccess={() => this.setState({ loadingError: false })}
    />);

    reloadEditFormData = e => {
        e.preventDefault();
        this.setState({ loadingError: false });
    }

    onAvailabilityDialogSaveClick = async (formData, id) => {
        const data = formData;
        const availValues = await this.editBoatsForm.current.getValue('avail');
        let index = null;
        availValues.map((v, i) => {
            if (v.id === id) {
                index = i;
            }
        });
        data.id = id;
        if (index !== null) {
            availValues[index] = data;
        } else {
            availValues.push(data);
        }
        await this.editBoatsForm.current.setValue('avail', availValues);
    }

    onBlocksDialogSaveClick = async (formData, id) => {
        const data = formData;
        const blocksValues = await this.editBoatsForm.current.getValue('blocks');
        let index = null;
        blocksValues.map((v, i) => {
            if (v.id === id) {
                index = i;
            }
        });
        data.id = id;
        if (index !== null) {
            blocksValues[index] = data;
        } else {
            blocksValues.push(data);
        }
        await this.editBoatsForm.current.setValue('blocks', blocksValues);
    }

    onPricesDialogSaveClick = async (formData, id) => {
        const data = formData;
        const pricesValues = await this.editBoatsForm.current.getValue('prices');
        let index = null;
        pricesValues.map((v, i) => {
            if (v.id === id) {
                index = i;
            }
        });
        data.id = id;
        if (index !== null) {
            pricesValues[index] = data;
        } else {
            pricesValues.push(data);
        }
        await this.editBoatsForm.current.setValue('prices', pricesValues);
    }

    onExtrasDialogSaveClick = async (formData, id) => {
        const data = formData;
        const extrasValues = await this.editBoatsForm.current.getValue('extras');
        let index = null;
        extrasValues.map((v, i) => {
            if (v.id === id) {
                index = i;
            }
        });
        data.id = id;
        if (index !== null) {
            extrasValues[index] = data;
        } else {
            extrasValues.push(data);
        }
        await this.editBoatsForm.current.setValue('extras', extrasValues);
    }

    render = () => (
        <AdminPanel>
            <I18n>
                {({ i18n }) => {
                    this.props.appDataRuntimeSetDocumentTitleAction(i18n._(this.props.match.params.id ? 'Edit Boat' : 'New Boat'), this.props.appData.language);
                    return (<>
                        <div className="uk-title-head uk-margin-bottom">{this.props.match.params.id ? <Trans>Edit Boat</Trans> : <Trans>New Boat</Trans>}</div>
                        {this.state.loadingError ? <div className="uk-alert-danger" uk-alert="true">
                            <Trans>Could not load data from server. Please check your URL or try to <a href="" onClick={this.reloadEditFormData}>reload</a> data.</Trans>
                        </div> : this.getEditForm(i18n)}
                        <BoatAvailabilityDialog
                            ref={this.boatAvailabilityDialog}
                            onAvailabilityDialogSaveClick={this.onAvailabilityDialogSaveClick}
                            i18n={i18n}
                        />
                        <BoatBlocksDialog
                            ref={this.boatBlocksDialog}
                            onBlocksDialogSaveClick={this.onBlocksDialogSaveClick}
                            i18n={i18n}
                        />
                        <BoatPricesDialog
                            ref={this.boatPricesDialog}
                            onPricesDialogSaveClick={this.onPricesDialogSaveClick}
                            i18n={i18n}
                        />
                        <BoatExtrasDialog
                            ref={this.boatExtrasDialog}
                            onExtrasDialogSaveClick={this.onExtrasDialogSaveClick}
                            i18n={i18n}
                        />
                    </>);
                }}
            </I18n>
        </AdminPanel>
    );
}

export default connect(store => ({
    appData: store.appData,
    appDataRuntime: store.appDataRuntime,
    appLingui: store.appLingui
}),
    dispatch => ({
        appDataRuntimeSetTokenAction: token => dispatch(appDataRuntimeSetToken(token)),
        appDataSetUserAction: user => dispatch(appDataSetUser(user)),
        appDataRuntimeSetDocumentTitleAction: (documentTitle, language) => dispatch(appDataRuntimeSetDocumentTitle(documentTitle, language))
    }))(BoatsEdit);