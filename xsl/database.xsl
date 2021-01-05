<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt" xmlns:ext="http://exslt.org/common" exclude-result-prefixes="ext msxsl">
	<xsl:output method="html" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" encoding="UTF-8" />

	<xsl:strip-space elements="*" />

	<!-- FIRST DUPLICATE ALL ELEMENTS with @_concerts that contains ";" or "&#xA;"???? -->
	<!-- then key will work -->

	<!-- PARAMETERS -->
	<xsl:param name="input" />
	<xsl:param name="id" />
	<xsl:param name="types" />

	<!-- VARIABLES -->
	<xsl:variable name="root" select="/" />
	<xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyzéèëêàçö'" />
	<xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZEEEEACO'" />
	<xsl:variable name="mainsheet" select="name(/*[1]/*[1])" />
	<xsl:variable name="linkedsheetNode" select="/*[1]/*[starts-with(name(.), '_')]" />

	<!--<xsl:variable name="typeElements">
		<xsl:call-template name="split">
			<xsl:with-param name="pText" select="$types"/>
		</xsl:call-template>
	</xsl:variable>-->

	<!--<xsl:variable name="ids">
		<xsl:call-template name="split">
			<xsl:with-param name="pText" select="$id" />
		</xsl:call-template>
	</xsl:variable>-->

	<!-- KEYS -->
	<!--<xsl:key name="linkids" match="/*[1]/*[starts-with(name(.), '_')]/*" use="string(attribute::*[name(.) = name(/*[1]/*[1])][1])" />-->
	<!--<xsl:key name="linkedsheet-ids_Type" match="/*[1]/*[starts-with(name(.), '_')]/*" use="concat(string(@type), '|', string(attribute::*[local-name(.) = name(/*[1]/*[1])]))"/>-->
	<!--<xsl:key name="linkedsheet-types" match="/*[1]/*[starts-with(name(.), '_')]/*" use="string(@type)" />-->
	<xsl:key name="allElements" match="*" use="string(attribute::*[1])" />

	<!--<xsl:key name="ids" match="/*[1]/*[1]/*" use="@id" />-->
	<!--<xsl:key name="idsToSplit" match="/*[1]/*[1]/*[contains(@id, '&#xA;')]" use="@id" />-->



	<!-- ############# -->
	<!-- ### START ### -->
	<!-- ############# -->

	<xsl:template match="/">
		<xsl:apply-templates select="*[1]" mode="heading" />
	</xsl:template>

	<!--HEADING-->
	<xsl:template match="*[1]" mode="heading">
		<!-- CHOOSE MODE: main sheet OR find childnodes in linkedsheet -->
		<xsl:choose>
			<xsl:when test="$id">
				<xsl:apply-templates select="child::*[starts-with(name(.), '_')][1]" mode="linkedsheet" />
			</xsl:when>
			<xsl:otherwise>
				<xsl:apply-templates select="child::*[1]" mode="mainsheet" />
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<!-- LINKED SHEET -->
	<xsl:template match="*" mode="linkedsheet">
		<!--<xsl:variable name="linkidsToSplit" select="/*[1]/*[starts-with(name(.), '_')]/*[attribute::*[name(.) = name(/*[1]/*[1])][1]][contains(string(.), '&#xA;')]" />-->
		<table id="{$id}+" class="linkedsheet row-border">
			<thead>
				<xsl:apply-templates select="*[1]" mode="autoheader" />
			</thead>
			<tbody>
				<!-- METHOD 1: check all nodes if @linkid CONTAINS @id -->
				<xsl:apply-templates select="child::*[attribute::*[name() = name(/*[1]/*[1])][1][contains(string(.), string($id))]]" mode="autovalues" />

				<!-- METHOD 2: use key for @linkid == @id (faster) + check remaining nodes for @linkid containing @id => FASTER OR SLOWER????? -->
				<!--<xsl:apply-templates select="key('linkids', string($id))" mode="autovalues" />
				<xsl:apply-templates select="/*[1]/*[starts-with(name(.), '_')]/*[contains(attribute::*[name(.) = name(/*[1]/*[1])][1], '&#xA;')][contains(attribute::*[name(.) = name(/*[1]/*[1])][1], $id)]" mode="autovalues" />-->
			</tbody>
		</table>
	</xsl:template>

	<!--MAIN SHEET-->
	<xsl:template match="*[1]" mode="mainsheet">
		<table class="mainsheet row-border hover" id="{local-name(.)}">
			<thead>
				<xsl:apply-templates select="*[1]" mode="autoheader" />
				<xsl:apply-templates select="*[1]" mode="autoheader" />
			</thead>
			<tbody>
				<xsl:choose>
					<xsl:when test="$input = ''">
						<xsl:apply-templates select="child::*" mode="autovalues" />
					</xsl:when>
					<xsl:otherwise>
						<!-- PERFORM SEARCH -->
						<xsl:apply-templates select="child::*[@*[contains(translate(., $smallcase, $uppercase), translate($input, $smallcase, $uppercase))] or *[contains(translate(., $smallcase, $uppercase), translate($input, $smallcase, $uppercase))]]" mode="autovalues" />
					</xsl:otherwise>
				</xsl:choose>
			</tbody>
		</table>
	</xsl:template>

	<!-- RUN THROUGHT ATTRIBUTES: make header -->
	<xsl:template match="*" mode="autoheader">
		<tr>
			<!-- COLUMN 1: details-control -->
			<xsl:apply-templates select="child::*[1]" mode="details-control-header" />
			<!-- COLUMN 2: COUNT types -->
			<xsl:if test="not($id)">
				<th class="linkedinfo">
					<xsl:value-of select="substring(local-name($linkedsheetNode), 2)" />
				</th>
			</xsl:if>
			<!--<xsl:apply-templates select="attribute::*[local-name() = $mainsheet]" mode="linkedinfo-header" />-->

			<xsl:apply-templates select="attribute::*[local-name() != $mainsheet][not(starts-with(name(.), '_'))]" mode="attributes-header">
				<xsl:sort select="position()" order="ascending" data-type="number" />
			</xsl:apply-templates>

			<xsl:apply-templates select="child::*" mode="children-header" />
		</tr>
	</xsl:template>

	<!--<xsl:template match="attribute::*" mode="attributes-header" priority="0">
		<!-\-<xsl:variable name="nextpos" select="position()+1" />-\->
		<!-\-<xsl:if test="not(starts-with(substring(name(.), 2), '-')) and not(starts-with(substring(name(.), 2), '('))">-\->
		<xsl:if test="not(starts-with(name(.), '_'))">
			<th>
				<xsl:if test="position() = 1">
					<xsl:attribute name="class">titlecolumn</xsl:attribute>
				</xsl:if>
				<xsl:value-of select="translate(name(.),'_', ' ')"/>
			</th>
		</xsl:if>
	</xsl:template>-->

	<!--<xsl:template match="attribute::*" mode="linkedinfo-header" priority="0">
		<th class="linkedinfo">
			<xsl:value-of select="substring(local-name($linkedsheetNode), 2)" />
		</th>
	</xsl:template>-->
	<!-- prevent special columns "-...", ":..." from forming a column-->
	<xsl:template match="attribute::*" mode="attributes-header" priority="0">
		<th>
			<xsl:value-of select="translate(name(.),'_', ' ')" />
		</th>
	</xsl:template>
	<xsl:template match="attribute::*[position() = 2]" mode="attributes-header" priority="0">
		<th class="title">
			<xsl:value-of select="translate(name(.),'_', ' ')" />
		</th>
	</xsl:template>

	<!-- RUN THROUGHT ATTRIBUTES: fill in values -->
	<xsl:template match="*" mode="autovalues">
		<xsl:variable name="currentID" select="string(@id)" />
		<tr id="{@id}">
			<xsl:apply-templates select="child::*[1]" mode="details-control-values" />
			<!-- COUNT linked items -->
			<xsl:if test="not($id)">
				<td class="linkedinfo">
					<xsl:attribute name="linkid">
						<xsl:value-of select="@id" />
					</xsl:attribute>
					<!--<xsl:variable name="el" select="."/>-->
					<!-- MET FOR EACH -->

					<!--<xsl:for-each select="ext:node-set($typeElements)/*">
						<xsl:variable name="type" select="string(.)"/>
						<xsl:for-each select="$root">
							<xsl:if test="key('linkedsheet-ids_Type', concat(string($type), '|', $currentID))">
								<div class="typeicon {string($type)}" title="type: {string($type)}">
									<xsl:value-of select="string($type)"/>
									<xsl:text>:</xsl:text>
									<span class="cssnumbers">
										<xsl:value-of select="count(key('linkedsheet-ids_Type', concat(string($type), '|', $currentID)))"/>
									</span>
								</div>
							</xsl:if>
						</xsl:for-each>
					</xsl:for-each>-->

				</td>
			</xsl:if>

			<!--<xsl:apply-templates select="attribute::*[local-name() = $mainsheet]" mode="linkedinfo-values" />-->

			<xsl:apply-templates select="attribute::*[local-name() != $mainsheet]" mode="attributes-values">
				<xsl:sort select="position()" order="ascending" data-type="number" />
			</xsl:apply-templates>

			<xsl:apply-templates select="child::*" mode="children-values" />
		</tr>
	</xsl:template>


	<!--<xsl:template match="attribute::*" mode="linkedinfo-values">
		<td class="linkedinfo" linkid="{../@id}"> </td>
	</xsl:template>-->
	<xsl:template match="attribute::*[starts-with(name(.), '_')]" mode="attributes-values" priority="0" />
	<xsl:template match="attribute::*[not(starts-with(name(.), '_'))]" mode="attributes-values" priority="0">
		<!--<xsl:if test="not(starts-with(substring(name(.), 2), '-')) and not(starts-with(name(.), ':'))">-->
		<!--<xsl:if test="not(starts-with(name(.), '_'))">-->
		<td>
			<!-- CREATE @title for hover tooltip (SLOW) -->
			<!--<xsl:if test="string(.) != ''">
					<xsl:attribute name="title">
						<xsl:apply-templates select="/*[1]/*[local-name(.) = local-name(current())]/*[attribute::*[1] = current()]/attribute::*" mode="hover" />
					</xsl:attribute>
				</xsl:if>-->
			<!-- END hover tooltip -->
			<!--<xsl:if test="/*[1]/*[local-name(.) = local-name(current())]/*[attribute::*[1] = current()]">-->
			<span>
				<xsl:if test="key('allElements', string(current()))">
					<xsl:attribute name="class">
						<xsl:text>idtip</xsl:text>
					</xsl:attribute>
				</xsl:if>
				<xsl:attribute name="sheet">
					<xsl:value-of select="local-name(.)" />
				</xsl:attribute>
				<xsl:value-of select="." />
			</span>
			<!-- COLUMN FORMAT FEATURES (could also be done in DataTables -->
			<xsl:variable name="nextpos" select="position()+1" />
			<!--<xsl:variable name="nextribute" select="./parent::*/@*[position()=$nextpos]"></xsl:variable>-->
			<xsl:if test="starts-with(name(../@*[position()=$nextpos]), '_')">
				<xsl:apply-templates select="../@*[position()=$nextpos][not(.='')]" mode="hiddencolumn" />
				<!--<xsl:if test="string-length(../@*[position()=$nextpos])">
					<xsl:choose>
						<xsl:when test="starts-with(substring(name(../@*[position()=$nextpos]), 2), '-')">
							<span class="padleft description">
								<xsl:text>(</xsl:text>
								<xsl:value-of select="../@*[position()=$nextpos]" />
								<xsl:text>)</xsl:text>
							</span>
						</xsl:when>
						<!-\-<xsl:when test="starts-with(name(./parent::*/@*[position()=$nextpos]), ':')">-\->
						<xsl:otherwise>
							<p class="details">
								<xsl:value-of select="substring(local-name(../@*[position()=$nextpos]),2)" />
								<xsl:text>: </xsl:text>
								<xsl:value-of select="../@*[position()=$nextpos]" />
							</p>
						</xsl:otherwise>
						<!-\-</xsl:when>-\->
					</xsl:choose>
				</xsl:if>-->
			</xsl:if>
		</td>
		<!--</xsl:if>-->
	</xsl:template>

	<xsl:template match="@*" mode="hiddencolumn">
		<p class="details">
			<xsl:value-of select="substring(name(.),2)" />
			<xsl:text>: </xsl:text>
			<xsl:value-of select="." />
		</p>
	</xsl:template>
	<xsl:template match="@*[starts-with(substring(name(.),2), '-')]" mode="hiddencolumn">
		<xsl:text> </xsl:text>
		<span class="description">
			<xsl:text>(</xsl:text>
			<xsl:value-of select="." />
			<xsl:text>)</xsl:text>
		</span>
	</xsl:template>
	<xsl:template match="@*[starts-with(substring(name(.),2), '.')]" mode="hiddencolumn">
		<p class="details">
			<xsl:value-of select="." />
		</p>
	</xsl:template>

	<xsl:template match="child::*" mode="children-header" priority="0">
		<th class="noVis">
			<xsl:value-of select="name(.)" />
		</th>
	</xsl:template>
	<xsl:template match="child::*" mode="children-values" priority="0">
		<td>
			<xsl:value-of select="." />
		</td>
	</xsl:template>

	<xsl:template match="child::*[1]" mode="details-control-header">
		<th class="details-control"><!-- details --></th>
	</xsl:template>
	<xsl:template match="child::*[1]" mode="details-control-values">
		<!-- DON'T ADD CLASS "details-control": there's not always dropdown info... -->
		<td class="details"><!-- details --></td>
	</xsl:template>

	<!-- FORMAT hover tooltip -->
	<!--<xsl:template match="attribute::*" mode="hover">
		<xsl:if test="string(.) != ''">
			<xsl:value-of select="local-name(.)" />
			<xsl:text>: </xsl:text>
			<xsl:value-of select="." />
			<xsl:text>&#10;</xsl:text>
		</xsl:if>
	</xsl:template>-->

	<!--<xsl:template name="split">
		<xsl:param name="pText"/>
		<!-\- types are seperated by a comma -\->
		<!-\-<xsl:variable name="separator">,</xsl:variable>-\->

		<xsl:choose>
			<xsl:when test="string-length($pText) = 0"/>
			<xsl:when test="contains($pText, ',')">
				<type>
					<xsl:value-of select="substring-before($pText, ',')"/>
				</type>
				<xsl:call-template name="split">
					<xsl:with-param name="pText" select="substring-after($pText, ',')"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<type>
					<xsl:value-of select="$pText"/>
				</type>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>-->

	<!-- AUTO OVERRIDE some common headers........................................................... -->
	<xsl:template match="@id" mode="attributes-header">
		<!--<xsl:attribute name="id">
			<xsl:value-of select="." />
		</xsl:attribute>-->
	</xsl:template>
	<xsl:template match="@id" mode="attributes-values">
		<!--<xsl:value-of select="." />-->
	</xsl:template>
	<xsl:template match="@DATUM | @Datum | @datum | @date | @rec_date" mode="attributes-header">
		<th class="date">
			<xsl:value-of select="name(.)" />
		</th>
	</xsl:template>

</xsl:stylesheet>
