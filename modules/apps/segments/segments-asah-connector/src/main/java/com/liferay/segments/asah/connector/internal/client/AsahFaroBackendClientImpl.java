/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.segments.asah.connector.internal.client;

import com.liferay.petra.string.CharPool;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.exception.NestableRuntimeException;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.segments.asah.connector.internal.client.data.binding.IndividualJSONObjectMapper;
import com.liferay.segments.asah.connector.internal.client.data.binding.IndividualSegmentJSONObjectMapper;
import com.liferay.segments.asah.connector.internal.client.model.Individual;
import com.liferay.segments.asah.connector.internal.client.model.IndividualSegment;
import com.liferay.segments.asah.connector.internal.client.model.Results;
import com.liferay.segments.asah.connector.internal.client.util.FilterBuilder;
import com.liferay.segments.asah.connector.internal.client.util.FilterConstants;
import com.liferay.segments.asah.connector.internal.client.util.OrderByField;

import java.io.IOException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.core.MultivaluedHashMap;
import javax.ws.rs.core.MultivaluedMap;

/**
 * @author David Arques
 */
public class AsahFaroBackendClientImpl implements AsahFaroBackendClient {

	public AsahFaroBackendClientImpl(
		JSONWebServiceClient jsonWebServiceClient,
		String asahFaroBackendDataSourceId,
		String asahFaroBackendSecuritySignature, String asahFaroBackendURL) {

		_jsonWebServiceClient = jsonWebServiceClient;

		_dataSourceId = asahFaroBackendDataSourceId;

		_headers.put(
			"OSB-Asah-Faro-Backend-Security-Signature",
			asahFaroBackendSecuritySignature);

		_jsonWebServiceClient.setBaseURI(asahFaroBackendURL);
	}

	@Override
	public String getDataSourceId() {
		return _dataSourceId;
	}

	@Override
	public Individual getIndividual(String individualPK) {
		FilterBuilder filterBuilder = new FilterBuilder();

		filterBuilder.addFilter(
			"dataSourceId", FilterConstants.COMPARISON_OPERATOR_EQUALS,
			getDataSourceId());
		filterBuilder.addFilter(
			"dataSourceIndividualPKs/individualPKs",
			FilterConstants.COMPARISON_OPERATOR_EQUALS, individualPK);

		MultivaluedHashMap<String, Object> uriVariables =
			new MultivaluedHashMap<>();

		uriVariables.putSingle("includeAnonymousUser", true);

		try {
			String response = _jsonWebServiceClient.doGet(
				_PATH_INDIVIDUALS,
				_getParameters(
					filterBuilder,
					FilterConstants.FIELD_NAME_CONTEXT_INDIVIDUAL, 1, 1, null,
					uriVariables),
				_headers);

			Results<Individual> individualResults =
				_individualJSONObjectMapper.mapToResults(response);

			List<Individual> items = individualResults.getItems();

			if (!ListUtil.isEmpty(items)) {
				return items.get(0);
			}

			return null;
		}
		catch (IOException ioe) {
			throw new NestableRuntimeException(
				_ERROR_MSG + ioe.getMessage(), ioe);
		}
	}

	@Override
	public Results<Individual> getIndividualResults(
		String individualSegmentId, int cur, int delta,
		List<OrderByField> orderByFields) {

		try {
			String response = _jsonWebServiceClient.doGet(
				StringUtil.replace(
					_PATH_INDIVIDUAL_SEGMENTS_INDIVIDUALS, "{id}",
					individualSegmentId),
				_getParameters(
					new FilterBuilder(),
					FilterConstants.FIELD_NAME_CONTEXT_INDIVIDUAL, cur, delta,
					orderByFields),
				_headers);

			return _individualJSONObjectMapper.mapToResults(response);
		}
		catch (IOException ioe) {
			throw new NestableRuntimeException(
				_ERROR_MSG + ioe.getMessage(), ioe);
		}
	}

	@Override
	public Results<IndividualSegment> getIndividualSegmentResults(
		int cur, int delta, List<OrderByField> orderByFields) {

		FilterBuilder filterBuilder = new FilterBuilder();

		filterBuilder.addFilter(
			"individualCount",
			FilterConstants.COMPARISON_OPERATOR_GREATER_THAN_OR_EQUAL, 1);
		filterBuilder.addFilter(
			"status", FilterConstants.COMPARISON_OPERATOR_EQUALS,
			IndividualSegment.Status.ACTIVE.name());

		try {
			String response = _jsonWebServiceClient.doGet(
				_PATH_INDIVIDUAL_SEGMENTS,
				_getParameters(
					filterBuilder,
					FilterConstants.FIELD_NAME_CONTEXT_INDIVIDUAL_SEGMENT, cur,
					delta, orderByFields),
				_headers);

			return _individualSegmentJSONObjectMapper.mapToResults(response);
		}
		catch (IOException ioe) {
			throw new NestableRuntimeException(
				_ERROR_MSG + ioe.getMessage(), ioe);
		}
	}

	private MultivaluedMap<String, Object> _getParameters(
		FilterBuilder filterBuilder, String fieldNameContext, int cur,
		int delta, List<OrderByField> orderByFields) {

		MultivaluedMap<String, Object> uriVariables = _getUriVariables(
			cur, delta, orderByFields, fieldNameContext);

		uriVariables.putSingle("filter", filterBuilder.build());

		return uriVariables;
	}

	private MultivaluedMap<String, Object> _getParameters(
		FilterBuilder filterBuilder, String fieldNameContext, int cur,
		int delta, List<OrderByField> orderByFields,
		MultivaluedMap<String, Object> initialUriVariables) {

		MultivaluedMap<String, Object> uriVariables = _getUriVariables(
			cur, delta, orderByFields, fieldNameContext, initialUriVariables);

		uriVariables.putSingle("filter", filterBuilder.build());

		return uriVariables;
	}

	private MultivaluedMap<String, Object> _getUriVariables(
		int cur, int delta, List<OrderByField> orderByFields,
		String fieldNameContext) {

		return _getUriVariables(
			cur, delta, orderByFields, fieldNameContext,
			new MultivaluedHashMap<>());
	}

	private MultivaluedMap<String, Object> _getUriVariables(
		int cur, int delta, List<OrderByField> orderByFields,
		String fieldNameContext, MultivaluedMap<String, Object> uriVariables) {

		uriVariables.putSingle("page", cur - 1);
		uriVariables.putSingle("size", delta);

		if ((orderByFields == null) || orderByFields.isEmpty()) {
			return uriVariables;
		}

		List<Object> sort = new ArrayList<>();

		for (OrderByField orderByField : orderByFields) {
			String fieldName = orderByField.getFieldName();

			if (!orderByField.isSystem() && (fieldNameContext != null)) {
				fieldName = StringUtil.replace(
					fieldNameContext, CharPool.QUESTION, fieldName);
			}

			sort.add(fieldName + StringPool.COMMA + orderByField.getOrderBy());
		}

		uriVariables.put("sort", sort);

		return uriVariables;
	}

	private static final String _ERROR_MSG = "Unable to handle JSON response: ";

	private static final String _PATH_INDIVIDUAL_SEGMENTS =
		"api/1.0/individual-segments";

	private static final String _PATH_INDIVIDUAL_SEGMENTS_INDIVIDUALS =
		_PATH_INDIVIDUAL_SEGMENTS + "/{id}/individuals";

	private static final String _PATH_INDIVIDUALS = "api/1.0/individuals";

	private static final IndividualJSONObjectMapper
		_individualJSONObjectMapper = new IndividualJSONObjectMapper();
	private static final IndividualSegmentJSONObjectMapper
		_individualSegmentJSONObjectMapper =
			new IndividualSegmentJSONObjectMapper();

	private final String _dataSourceId;
	private final Map<String, String> _headers = new HashMap<>();
	private final JSONWebServiceClient _jsonWebServiceClient;

}