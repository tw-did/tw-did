import React from 'react';
import { expect, it, describe, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { CredentialCardProps, CredentialCard, CredentialType } from '.';
import { CredentialFieldKey, CredentialViewData } from './hooks/CredentialData';

describe('<Credential />', () => {
  const credential = new CredentialViewData(
    CredentialType.ETHEREUM,
    [
      { key: CredentialFieldKey.NATION_ID, value: 'A123456789' },
      { key: CredentialFieldKey.ETHEREUM_ADDRESS, value: '0x1234567890abcdef' },
    ],
    [],
    'Test description'
  );

  const baseProps: CredentialCardProps = {
    credentialView: credential,
    actions: [
      {
        label: 'Test Action',
        handler: vi.fn(),
      },
    ],
  };

  it('renders the type correctly', () => {
    const { getByTestId } = render(<CredentialCard {...baseProps} />);
    expect(getByTestId('credential-type-ethereum')).toBeInTheDocument();
  });

  it('renders the description if provided', () => {
    const { getByTestId } = render(<CredentialCard {...baseProps} />);
    expect(getByTestId('credential-description')).toHaveTextContent(
      'Test description'
    );
  });

  it('renders all the fields correctly', () => {
    const { getByTestId } = render(<CredentialCard {...baseProps} />);
    expect(getByTestId('field-key-national-id')).toHaveTextContent(
      'national-id'
    );
    expect(getByTestId('field-value-national-id')).toHaveTextContent(
      'A123456789'
    );
  });

  it('renders all the actions and they can be triggered', () => {
    const { getByTestId } = render(<CredentialCard {...baseProps} />);
    const actionButton = getByTestId('credential-action-Test Action');
    expect(actionButton).toBeTruthy();

    fireEvent.click(actionButton);
    expect(baseProps.actions[0].handler).toHaveBeenCalled();
  });
});
