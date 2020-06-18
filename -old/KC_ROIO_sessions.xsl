<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

	<xsl:param name="chooseParameter"/>

	<xsl:strip-space elements="artist"/>
	<xsl:strip-space elements="country"/>
	<xsl:strip-space elements="event"/>

	<xsl:template match="/">

		<table class="sessionTable" id="sessionTable" border="0" cellpadding="2" cellspacing="0" style="width:100%;">
			<thead>
				<tr style="background-color:#EEEEEE;">
					<th style="width:2%"/>
					<th style="width:9;%">Date</th>
					<th style="width:29%">Location</th>
					<th style="width:40%">Contributing artists</th>
					<th style="width:5%">Length</th>
					<th style="width:6%">Source</th>
					<th style="width:4%">Q</th>
					<th style="width:5%"/>
				</tr>
			</thead>
			<tbody>
				<xsl:apply-templates select="//session[(artists/* = $chooseParameter) or (location/country = $chooseParameter) or (location/event = $chooseParameter) or contains(substring(date,1,4), string($chooseParameter))]">
					<xsl:sort select="date" order="ascending"/>
				</xsl:apply-templates>
			</tbody>

		</table>

	</xsl:template>

	<xsl:template match="//session">
		<tr class="sessionrow">
			<xsl:attribute name="id">
				<xsl:value-of select="@id"/>
			</xsl:attribute>
			<td style="text-align:center">
				<!--<xsl:value-of select="@av"/>-->
				<xsl:choose>
					<xsl:when test="@av = 'A'">
						<img src="audio-icon.png" alt="A" height="24" width="24"/>
					</xsl:when>
					<xsl:otherwise>
						<img src="video-icon.png" alt="V" height="24" width="24"/>
					</xsl:otherwise>
				</xsl:choose>
			</td>
			<td style="padding:8px;text-align:left">
				<xsl:value-of select="date"/>
			</td>
			<td>
				<!--<xsl:value-of select="location"/>-->
				<xsl:apply-templates select="location/*"/>
				<xsl:apply-templates select="title"/>
				<xsl:apply-templates select="product"/>
			</td>
			<td>
				<!--<xsl:apply-templates select="artists/band"/>-->
				<!--<xsl:value-of select="artists"/>-->
				<!--<xsl:apply-templates select="artists/*[*]"/>-->
				<xsl:apply-templates select="artists/*"/>
			</td>
			<td style="text-align:center">
				<xsl:value-of select="length"/>
			</td>
			<td style="text-align:center">
				<!--source-->
				<xsl:apply-templates select="./@official"/>
				<xsl:value-of select="source"/>

				<!--format-->
				<br/>
				<em>
					<xsl:value-of select="format"/>
					<xsl:apply-templates select="format/@bitrate"/>
					<xsl:apply-templates select="format/@resolution"/>
				</em>
			</td>
			<td style="text-align:center">
				<xsl:value-of select="quality"/>
			</td>
			<td style="text-align:center">
				<input type="button" value="extra" style="border:1;background:none;width:49px;" class="xtrClass"/>
			</td>
		</tr>
		<tr id="xtr_{generate-id(.)}" height="1" style="display:none">
			<td colspan="8" bgcolor="#EEEEEE">
				<strong>Lineage: </strong>
				<xsl:choose>
					<xsl:when test="lineage != ''">
						<xsl:value-of select="lineage"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text>unknown</xsl:text>
					</xsl:otherwise>
				</xsl:choose>
				<br/>
				<xsl:value-of select="remarks"/>
			</td>
		</tr>
		<tr height="1">
			<td colspan="8" bgcolor="#CCCCCC"/>
		</tr>
	</xsl:template>

	<!--	  hieronder stond: match="artists/artist[@type = 'band']-->
	<xsl:template priority="2" match="artists/*[@type = 'band']">
		<em><xsl:value-of select="."/>: </em>
	</xsl:template>

	<xsl:template match="@official">
		<xsl:text>official </xsl:text>
	</xsl:template>

	<xsl:template match="@bitrate">
		<xsl:text><![CDATA[@]]></xsl:text>
		<xsl:value-of select="."/>
	</xsl:template>

	<xsl:template match="@resolution">
		<xsl:text>-</xsl:text>
		<xsl:value-of select="."/>
	</xsl:template>

	<xsl:template match="title">
		<br/>
		<em>
			<xsl:value-of select="."/>
		</em>
	</xsl:template>
	
	<xsl:template match="product">
		<br/>
		<em>
			<xsl:value-of select="."/>
		</em>
	</xsl:template>

	<!--	<xsl:template priority="2" match="artists/*[name() = name(preceding-sibling::*[1])] | artists/*/*[position() > 1]">
		<xsl:value-of select="concat(', ', .)"/>
	</xsl:template>-->

	<xsl:template match="artists/*">
		<xsl:value-of select="."/>
		<!--<xsl:value-of select="concat(@value,', ')"/>-->
		<xsl:if test="not(position()=last())">
			<xsl:text>, </xsl:text>
		</xsl:if>
	</xsl:template>

	<xsl:template match="location/*">
		<xsl:value-of select="."/>
		<!--<xsl:value-of select="concat(@value,', ')"/>-->
		<xsl:if test="not(position()=last())">
			<xsl:text>, </xsl:text>
		</xsl:if>
	</xsl:template>

</xsl:stylesheet>